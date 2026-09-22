import asyncio
import json
import logging
import uuid
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings
from app.services.connection_manager import connection_manager

logger = logging.getLogger(__name__)

# Channels
USER_CHANNEL_PREFIX = "user:"
USER_CHANNEL_SUFFIX = ":events"
BROADCAST_CHANNEL = "events:broadcast"

# Global redis client and listener task
_redis_client: aioredis.Redis | None = None
_listener_task: asyncio.Task[None] | None = None


def get_redis_client() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2.0,
            socket_timeout=2.0,
        )
    return _redis_client


def build_event_payload(payload: Any, event_type: str = "message") -> dict[str, Any]:
    """
    Format payload into a consistent event envelope if it is not already structured.
    Allows passing any raw dict, string, or arbitrary object.
    """
    if isinstance(payload, dict):
        if "type" not in payload:
            return {"type": event_type, "data": payload}
        return payload
    return {"type": event_type, "data": payload}


async def publish_to_user(
    user_id: uuid.UUID | str,
    payload: Any,
    event_type: str = "message",
) -> None:
    """
    Inject a message, notification, or arbitrary event to a specific user.
    Uses Redis Pub/Sub if available, with immediate in-memory fallback.
    """
    uid = uuid.UUID(str(user_id)) if not isinstance(user_id, uuid.UUID) else user_id
    envelope = build_event_payload(payload, event_type=event_type)
    serialized = json.dumps(envelope, default=str)
    channel = f"{USER_CHANNEL_PREFIX}{uid}{USER_CHANNEL_SUFFIX}"

    published = False
    try:
        client = get_redis_client()
        # Ping check / publish
        await client.publish(channel, serialized)
        published = True
    except Exception as e:
        logger.warning(
            "Redis publish failed for user %s (%s). Falling back to direct in-memory delivery.",
            uid,
            e,
        )
    if not published:
        await connection_manager.send_to_user(uid, envelope)


async def broadcast_to_all(
    payload: Any,
    event_type: str = "broadcast",
) -> None:
    """
    Broadcast an event, notification, or system announcement to all connected users.
    """
    envelope = build_event_payload(payload, event_type=event_type)
    serialized = json.dumps(envelope, default=str)

    published = False
    try:
        client = get_redis_client()
        await client.publish(BROADCAST_CHANNEL, serialized)
        published = True
    except Exception as e:
        logger.warning(
            "Redis broadcast failed (%s). Falling back to in-memory broadcast.",
            e,
        )

    if not published:
        await connection_manager.broadcast(envelope)


async def redis_pubsub_listener() -> None:
    """
    Background listener that subscribes to Redis pattern channels.
    Routes received Redis messages to active local WebSocket connections.
    """
    retry_delay = 1.0
    while True:
        try:
            client = get_redis_client()
            pubsub = client.pubsub()
            await pubsub.psubscribe(f"{USER_CHANNEL_PREFIX}*{USER_CHANNEL_SUFFIX}")
            await pubsub.subscribe(BROADCAST_CHANNEL)
            logger.info("Redis Pub/Sub listener connected and subscribed.")
            retry_delay = 1.0

            async for message in pubsub.listen():
                msg_type = message.get("type")
                if msg_type not in ("pmessage", "message"):
                    continue

                raw_data = message.get("data")
                if not raw_data or not isinstance(raw_data, str):
                    continue

                try:
                    payload = json.loads(raw_data)
                except Exception:
                    payload = raw_data

                channel = message.get("channel", "")
                if channel == BROADCAST_CHANNEL:
                    await connection_manager.broadcast(payload)
                elif channel.startswith(USER_CHANNEL_PREFIX) and channel.endswith(USER_CHANNEL_SUFFIX):
                    # Extract user_id string between prefix and suffix
                    uid_str = channel[len(USER_CHANNEL_PREFIX) : -len(USER_CHANNEL_SUFFIX)]
                    try:
                        uid = uuid.UUID(uid_str)
                        await connection_manager.send_to_user(uid, payload)
                    except ValueError:
                        logger.warning("Invalid UUID in Redis channel: %s", channel)

        except asyncio.CancelledError:
            logger.info("Redis Pub/Sub listener cancelled.")
            break
        except Exception as e:
            logger.warning(
                "Redis listener error (%s). Reconnecting in %.1fs...", e, retry_delay
            )
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, 30.0)


async def start_redis_listener() -> None:
    global _listener_task
    if _listener_task is None or _listener_task.done():
        _listener_task = asyncio.create_task(redis_pubsub_listener())


async def stop_redis_listener() -> None:
    global _listener_task, _redis_client
    if _listener_task:
        _listener_task.cancel()
        try:
            await _listener_task
        except asyncio.CancelledError:
            pass
        _listener_task = None

    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
