import { describe, expect, it } from "bun:test"
import { QueryClient, QueryObserver } from "@tanstack/react-query"
import type { ChatMessagePublic, ConversationDetailPublic, ConversationPublic, ConversationsPublic } from "@/client"
import { areConversationPropsEqual } from "@/components/messages/conversation-list"
import { chatKeys } from "@/data/chat-keys"
import { applyIncomingMessageToCache, updateConversationLists } from "./useChatEventHandler"

function makeMessage(overrides: Partial<ChatMessagePublic> = {}): ChatMessagePublic {
	return {
		id: "msg-1",
		conversation_id: "conv-1",
		sender_id: "user-2",
		content: "Hello!",
		is_read: false,
		created_at: "2026-11-11T10:00:00Z",
		...overrides,
	}
}

function makeConversation(overrides: Partial<ConversationPublic> = {}): ConversationPublic {
	return {
		id: "conv-1",
		client_id: "me",
		freelancer_id: "user-2",
		creator_id: "me",
		created_at: "2026-11-10T10:00:00Z",
		updated_at: "2026-11-10T10:00:00Z",
		unread_count: 0,
		other_user: {
			id: "user-2",
			full_name: "User Two",
		},
		other_user_role: "freelancer",
		last_message: makeMessage({ id: "msg-0", content: "Earlier" }),
		...overrides,
	}
}

describe("applyIncomingMessageToCache", () => {
	it("moves non-top conversation to index 0, updates unread_count, and keeps sibling references intact", async () => {
		const queryClient = new QueryClient()
		const conv1 = makeConversation({ id: "conv-1", unread_count: 0 })
		const conv2 = makeConversation({
			id: "conv-2",
			freelancer_id: "user-3",
			unread_count: 2,
			other_user: { id: "user-3", full_name: "User Three" },
			last_message: makeMessage({ id: "msg-old", conversation_id: "conv-2", sender_id: "user-3" }),
		})
		const conv3 = makeConversation({
			id: "conv-3",
			freelancer_id: "user-4",
			unread_count: 1,
			other_user: { id: "user-4", full_name: "User Four" },
		})

		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [conv1, conv2, conv3],
			count: 3,
		})

		const incoming = makeMessage({
			id: "msg-new",
			conversation_id: "conv-2",
			sender_id: "user-3",
			content: "Checking in",
		})
		await applyIncomingMessageToCache(queryClient, incoming)

		const updated = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))
		expect(updated?.data.map((c) => c.id)).toEqual(["conv-2", "conv-1", "conv-3"])
		expect(updated?.data[0]?.last_message).toEqual(incoming)
		expect(updated?.data[0]?.unread_count).toBe(3)
		expect(updated?.data[1]).toEqual(conv1)
		expect(updated?.data[2]).toBe(conv3)

		// Subsequent message for top conversation preserves exact object references for all siblings
		const secondIncoming = makeMessage({
			id: "msg-new-2",
			conversation_id: "conv-2",
			sender_id: "user-3",
			content: "Follow-up",
		})
		const shiftedConv1 = updated?.data[1]
		await applyIncomingMessageToCache(queryClient, secondIncoming)
		const afterTopUpdate = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))
		expect(afterTopUpdate?.data[0]?.unread_count).toBe(4)
		expect(afterTopUpdate?.data[1]).toBe(shiftedConv1)
		expect(afterTopUpdate?.data[2]).toBe(conv3)
	})

	it("updates role-scoped cache and does not notify or mutate unrelated role caches", async () => {
		const queryClient = new QueryClient()
		const clientConv = makeConversation({ id: "conv-client", unread_count: 0 })
		const freelancerConv = makeConversation({ id: "conv-freelancer", unread_count: 1 })

		const clientList: ConversationsPublic = { data: [clientConv], count: 1 }
		const freelancerList: ConversationsPublic = { data: [freelancerConv], count: 1 }

		queryClient.setQueryData(chatKeys.conversations("client"), clientList)
		queryClient.setQueryData(chatKeys.conversations("freelancer"), freelancerList)

		let freelancerObserverNotifications = 0
		const freelancerObserver = new QueryObserver(queryClient, {
			queryKey: chatKeys.conversations("freelancer"),
			enabled: false,
		})
		const unsubscribe = freelancerObserver.subscribe(() => {
			freelancerObserverNotifications += 1
		})

		const incoming = makeMessage({
			id: "msg-client-1",
			conversation_id: "conv-client",
			content: "Client message",
		})
		await applyIncomingMessageToCache(queryClient, incoming)
		unsubscribe()

		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))?.data[0]?.unread_count).toBe(
			1,
		)
		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("freelancer"))).toBe(freelancerList)
		expect(freelancerObserverNotifications).toBe(0)
	})

	it("deduplicates repeated message delivery in both list and detail caches", async () => {
		const queryClient = new QueryClient()
		const existingMsg = makeMessage({ id: "msg-dup", conversation_id: "conv-1", content: "Hello" })
		const conv1 = makeConversation({ id: "conv-1", unread_count: 1, last_message: existingMsg })
		const list: ConversationsPublic = { data: [conv1], count: 1 }
		const detail: ConversationDetailPublic = {
			...conv1,
			messages: [existingMsg],
		}

		queryClient.setQueryData(chatKeys.conversations("client"), list)
		queryClient.setQueryData(chatKeys.conversation("conv-1"), detail)

		await applyIncomingMessageToCache(queryClient, existingMsg)

		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))).toBe(list)
		expect(queryClient.getQueryData<ConversationDetailPublic>(chatKeys.conversation("conv-1"))).toBe(detail)
	})

	it("appends to conversation detail cache and skips unread increment when viewing or incrementUnread=false", async () => {
		const queryClient = new QueryClient()
		const conv1 = makeConversation({ id: "conv-1", unread_count: 0 })
		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [conv1],
			count: 1,
		})
		queryClient.setQueryData<ConversationDetailPublic>(chatKeys.conversation("conv-1"), {
			...conv1,
			messages: [],
		})

		const msg = makeMessage({ id: "msg-view", conversation_id: "conv-1", content: "In active chat" })
		await applyIncomingMessageToCache(queryClient, msg, { incrementUnread: true, isViewingConversation: true })

		const listAfter = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))
		const detailAfter = queryClient.getQueryData<ConversationDetailPublic>(chatKeys.conversation("conv-1"))
		expect(listAfter?.data[0]?.last_message).toEqual(msg)
		expect(listAfter?.data[0]?.unread_count).toBe(0)
		expect(detailAfter?.messages).toEqual([msg])
		expect(detailAfter?.unread_count).toBe(0)
	})

	it("when conversation is missing from all caches, invalidates all and refetches only active queries", async () => {
		const queryClient = new QueryClient()
		let activeFetchCount = 0
		let inactiveFetchCount = 0

		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [],
			count: 0,
		})
		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("freelancer"), {
			data: [],
			count: 0,
		})

		const activeObserver = new QueryObserver<ConversationsPublic>(queryClient, {
			queryKey: chatKeys.conversations("client"),
			staleTime: 60_000,
			queryFn: async () => {
				activeFetchCount += 1
				return { data: [makeConversation({ id: "conv-brand-new" })], count: 1 }
			},
		})
		const unsubscribeActive = activeObserver.subscribe(() => {})

		queryClient.setQueryDefaults(chatKeys.conversations("freelancer"), {
			queryFn: async () => {
				inactiveFetchCount += 1
				return { data: [], count: 0 }
			},
		})

		const msg = makeMessage({ id: "msg-new-thread", conversation_id: "conv-brand-new", content: "Hi!" })
		await applyIncomingMessageToCache(queryClient, msg)
		unsubscribeActive()

		expect(activeFetchCount).toBe(1)
		expect(inactiveFetchCount).toBe(0)
		expect(queryClient.getQueryState(chatKeys.conversations("freelancer"))?.isInvalidated).toBe(true)
	})

	it("does not invalidate or mutate unrelated role caches when message is a duplicate in matching role cache", async () => {
		const queryClient = new QueryClient()
		const existingMsg = makeMessage({ id: "msg-dup", conversation_id: "conv-1" })
		const clientList: ConversationsPublic = {
			data: [makeConversation({ id: "conv-1", unread_count: 1, last_message: existingMsg })],
			count: 1,
		}
		const freelancerList: ConversationsPublic = {
			data: [makeConversation({ id: "conv-other", unread_count: 0 })],
			count: 1,
		}

		queryClient.setQueryData(chatKeys.conversations("client"), clientList)
		queryClient.setQueryData(chatKeys.conversations("freelancer"), freelancerList)

		await applyIncomingMessageToCache(queryClient, existingMsg)

		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))).toBe(clientList)
		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("freelancer"))).toBe(freelancerList)
		expect(queryClient.getQueryState(chatKeys.conversations("client"))?.isInvalidated).toBe(false)
		expect(queryClient.getQueryState(chatKeys.conversations("freelancer"))?.isInvalidated).toBe(false)
	})

	it("skips chatKeys.conversation cache writes when detail cache is absent or already has the message", async () => {
		const queryClient = new QueryClient()
		const existingMsg = makeMessage({ id: "msg-existing", conversation_id: "conv-1" })
		const conv1 = makeConversation({ id: "conv-1", last_message: existingMsg, unread_count: 1 })
		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [conv1],
			count: 1,
		})

		const detailWriteEvents: string[] = []
		const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
			if (
				event.query.queryKey[0] === "chat" &&
				event.query.queryKey[1] === "conversation" &&
				(event.type === "added" || event.type === "updated")
			) {
				detailWriteEvents.push(event.type)
			}
		})

		// 1. Detail cache is absent -> no detail query write or creation
		const newMsg = makeMessage({ id: "msg-fresh", conversation_id: "conv-1", content: "No detail cached" })
		await applyIncomingMessageToCache(queryClient, newMsg)
		expect(queryClient.getQueryData(chatKeys.conversation("conv-1"))).toBeUndefined()
		expect(detailWriteEvents).toEqual([])

		// 2. Detail cache exists and already has message.id -> no QueryCache or QueryObserver update
		const detail: ConversationDetailPublic = {
			...conv1,
			last_message: newMsg,
			messages: [existingMsg, newMsg],
		}
		queryClient.setQueryData(chatKeys.conversation("conv-1"), detail)
		const initialUpdatedAt = queryClient.getQueryState(chatKeys.conversation("conv-1"))?.dataUpdatedAt
		detailWriteEvents.length = 0

		let observerNotifications = 0
		const detailObserver = new QueryObserver(queryClient, {
			queryKey: chatKeys.conversation("conv-1"),
			enabled: false,
		})
		const unsubscribeObserver = detailObserver.subscribe(() => {
			observerNotifications += 1
		})

		await applyIncomingMessageToCache(queryClient, newMsg)
		unsubscribeObserver()
		unsubscribeCache()

		expect(observerNotifications).toBe(0)
		expect(detailWriteEvents).toEqual([])
		expect(queryClient.getQueryState(chatKeys.conversation("conv-1"))?.dataUpdatedAt).toBe(initialUpdatedAt)
		expect(queryClient.getQueryData<ConversationDetailPublic>(chatKeys.conversation("conv-1"))).toBe(detail)
	})
})

describe("updateConversationLists", () => {
	it("updates non-top conversation in place when moveToTop is false and preserves sibling references", () => {
		const queryClient = new QueryClient()
		const conv1 = makeConversation({ id: "conv-1", unread_count: 1 })
		const conv2 = makeConversation({ id: "conv-2", unread_count: 2 })
		const conv3 = makeConversation({ id: "conv-3", unread_count: 0 })

		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [conv1, conv2, conv3],
			count: 3,
		})

		const found = updateConversationLists(queryClient, "conv-2", (conv) => ({
			...conv,
			unread_count: 0,
			last_message: conv.last_message ? { ...conv.last_message, is_read: true } : conv.last_message,
		}))

		expect(found).toBe(true)
		const updated = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))
		expect(updated?.data.map((c) => c.id)).toEqual(["conv-1", "conv-2", "conv-3"])
		expect(updated?.data[0]).toBe(conv1)
		expect(updated?.data[1]?.unread_count).toBe(0)
		expect(updated?.data[1]?.last_message?.is_read).toBe(true)
		expect(updated?.data[2]).toBe(conv3)
	})

	it("returns found=true without notifying observers when updater returns undefined or same reference", () => {
		const queryClient = new QueryClient()
		const conv1 = makeConversation({ id: "conv-1", unread_count: 0 })
		const list: ConversationsPublic = { data: [conv1], count: 1 }
		queryClient.setQueryData(chatKeys.conversations("client"), list)

		let notifications = 0
		const observer = new QueryObserver(queryClient, {
			queryKey: chatKeys.conversations("client"),
			enabled: false,
		})
		const unsubscribe = observer.subscribe(() => {
			notifications += 1
		})

		expect(updateConversationLists(queryClient, "conv-1", () => undefined)).toBe(true)
		expect(updateConversationLists(queryClient, "conv-1", (conv) => conv)).toBe(true)
		expect(updateConversationLists(queryClient, "missing-conv", (conv) => conv)).toBe(false)
		unsubscribe()

		expect(notifications).toBe(0)
		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))).toBe(list)
	})

	it("updates index 0 in place when moveToTop is true and leaves other role lists untouched", () => {
		const queryClient = new QueryClient()
		const conv1 = makeConversation({ id: "conv-1", unread_count: 1 })
		const conv2 = makeConversation({ id: "conv-2", unread_count: 0 })
		const freelancerList: ConversationsPublic = {
			data: [makeConversation({ id: "conv-other", unread_count: 3 })],
			count: 1,
		}

		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [conv1, conv2],
			count: 2,
		})
		queryClient.setQueryData(chatKeys.conversations("freelancer"), freelancerList)

		const nextMsg = makeMessage({ id: "msg-top", conversation_id: "conv-1", content: "Top update" })
		const found = updateConversationLists(
			queryClient,
			"conv-1",
			(conv) => ({ ...conv, unread_count: 0, last_message: nextMsg }),
			{ moveToTop: true },
		)

		expect(found).toBe(true)
		const clientAfter = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))
		expect(clientAfter?.data.map((c) => c.id)).toEqual(["conv-1", "conv-2"])
		expect(clientAfter?.data[0]?.unread_count).toBe(0)
		expect(clientAfter?.data[0]?.last_message).toEqual(nextMsg)
		expect(clientAfter?.data[1]).toBe(conv2)
		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("freelancer"))).toBe(freelancerList)
	})
})

describe("applyIncomingMessageToCache edge cases", () => {
	it("ignores a replayed older message already in detail cache when detail.last_message differs", async () => {
		const queryClient = new QueryClient()
		const olderMsg = makeMessage({ id: "msg-1", conversation_id: "conv-1", content: "First" })
		const newerMsg = makeMessage({ id: "msg-2", conversation_id: "conv-1", content: "Second" })
		const conv1 = makeConversation({ id: "conv-1", unread_count: 1, last_message: newerMsg })
		const listBefore: ConversationsPublic = { data: [conv1], count: 1 }
		const detailBefore: ConversationDetailPublic = {
			...conv1,
			last_message: newerMsg,
			messages: [olderMsg, newerMsg],
		}

		queryClient.setQueryData(chatKeys.conversations("client"), listBefore)
		queryClient.setQueryData(chatKeys.conversation("conv-1"), detailBefore)

		await applyIncomingMessageToCache(queryClient, olderMsg)

		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))).toBe(listBefore)
		expect(queryClient.getQueryData<ConversationDetailPublic>(chatKeys.conversation("conv-1"))).toBe(detailBefore)
	})

	it("no-ops safely when incoming message is missing conversation_id", async () => {
		const queryClient = new QueryClient()
		const listBefore: ConversationsPublic = {
			data: [makeConversation({ id: "conv-1" })],
			count: 1,
		}
		queryClient.setQueryData(chatKeys.conversations("client"), listBefore)

		await applyIncomingMessageToCache(queryClient, makeMessage({ conversation_id: "" }))

		expect(queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))).toBe(listBefore)
	})
})

describe("areConversationPropsEqual", () => {
	it("returns true for a shifted sibling cloned by TanStack structural sharing and false for the updated row", async () => {
		const queryClient = new QueryClient()
		const conv1 = makeConversation({ id: "conv-1", unread_count: 0 })
		const conv2 = makeConversation({
			id: "conv-2",
			freelancer_id: "user-3",
			unread_count: 0,
			other_user: { id: "user-3", full_name: "User Three" },
			last_message: makeMessage({ id: "msg-old", conversation_id: "conv-2", sender_id: "user-3" }),
		})

		queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations("client"), {
			data: [conv1, conv2],
			count: 2,
		})

		const incoming = makeMessage({
			id: "msg-new",
			conversation_id: "conv-2",
			sender_id: "user-3",
			content: "Moved to top",
		})
		await applyIncomingMessageToCache(queryClient, incoming)

		const after = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations("client"))
		const movedConv2 = after?.data[0]
		const shiftedConv1 = after?.data[1]
		if (!movedConv2 || !shiftedConv1) {
			throw new Error("Expected both conversations after cache update")
		}

		// TanStack Query replaceEqualDeep compares arrays by index, so shifting conv1 0 -> 1 clones its reference.
		expect(shiftedConv1).toEqual(conv1)
		expect(shiftedConv1).not.toBe(conv1)

		const onSelect = () => {}
		expect(
			areConversationPropsEqual(
				{ conversation: conv1, profile: undefined, active: false, userOnline: false, onSelect },
				{ conversation: shiftedConv1, profile: undefined, active: false, userOnline: false, onSelect },
			),
		).toBe(true)
		expect(
			areConversationPropsEqual(
				{ conversation: conv2, profile: undefined, active: false, userOnline: false, onSelect },
				{ conversation: movedConv2, profile: undefined, active: false, userOnline: false, onSelect },
			),
		).toBe(false)
	})
})
