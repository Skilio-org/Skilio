import json
import logging
import uuid
from collections import defaultdict
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


def _serialize_payload(payload: Any) -> str:
    if isinstance(payload, str):
        return payload
    return json.dumps(payload, default=str)


class ConnectionManager:
    def __init__(self) -> None:
        # Maps user_id -> set of active WebSockets (supports multiple devices/tabs per user)
        self._active_connections: dict[uuid.UUID, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket) -> None:
        self._active_connections[user_id].add(websocket)
        logger.info(
            "WebSocket connected for user %s (total sockets for user: %d)",
            user_id,
            len(self._active_connections[user_id]),
        )

    def disconnect(self, user_id: uuid.UUID, websocket: WebSocket) -> None:
        if user_id in self._active_connections:
            self._active_connections[user_id].discard(websocket)
            if not self._active_connections[user_id]:
                del self._active_connections[user_id]
        logger.info("WebSocket disconnected for user %s", user_id)

    def is_user_online(self, user_id: uuid.UUID) -> bool:
        return bool(self._active_connections.get(user_id))

    def get_online_users(self) -> list[uuid.UUID]:
        return list(self._active_connections.keys())

    async def send_to_user(self, user_id: uuid.UUID, payload: Any) -> int:
        """
        Send a payload to all active connections for a given user.
        Returns the number of active connections successfully reached.
        """
        sockets = self._active_connections.get(user_id)
        if not sockets:
            return 0

        serialized = _serialize_payload(payload)
        dead_sockets: list[WebSocket] = []
        delivered = 0

        for ws in list(sockets):
            try:
                await ws.send_text(serialized)
                delivered += 1
            except Exception as e:
                logger.warning(
                    "Error sending to user %s websocket: %s", user_id, e
                )
                dead_sockets.append(ws)

        for ws in dead_sockets:
            self.disconnect(user_id, ws)

        return delivered

    async def broadcast(
        self, payload: Any, exclude_user_id: uuid.UUID | None = None
    ) -> int:
        """
        Broadcast a payload to all connected users.
        """
        serialized = _serialize_payload(payload)
        delivered = 0
        dead_pairs: list[tuple[uuid.UUID, WebSocket]] = []

        for uid, sockets in list(self._active_connections.items()):
            if exclude_user_id and uid == exclude_user_id:
                continue
            for ws in list(sockets):
                try:
                    await ws.send_text(serialized)
                    delivered += 1
                except Exception:
                    dead_pairs.append((uid, ws))

        for uid, ws in dead_pairs:
            self.disconnect(uid, ws)

        return delivered


# Singleton instance
connection_manager = ConnectionManager()
