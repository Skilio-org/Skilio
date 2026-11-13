import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { InboxIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type {
	ChatMessagePublic,
	ConversationDetailPublic,
	ConversationsPublic,
} from "@/client/types.gen";
import { EmptyState } from "@/components/common/empty-state";
import {
	WorkspacePageHeader,
	workspaceStyles,
} from "@/components/dashboard/dashboard-header";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import type { InboxFilter } from "@/components/messages/message-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWebSocket } from "@/context/websocket-context";
import { chatKeys } from "@/data/chat-keys";
import { useAccountRole } from "@/hooks/useAccountRole";
import useAuth from "@/hooks/useAuth";
import { useChatData } from "@/hooks/useChatData";
import { useCreateConversation } from "@/hooks/useCreateConversation";
import { createFallbackProfile } from "@/hooks/useProfiles";
import {
	useConversation,
	useConversationUpdate,
} from "@/hooks/userConversation";
import { useUsersOnline } from "@/hooks/useUserOnlineStatus";

export function MessagesPage({
	SelectedUserId,
	onSelectContact,
}: {
	SelectedUserId: string | undefined;
	onSelectContact: (id: string) => void;
}) {
	// TODO: What if the conversations does not even exist.. yet...
	// 1. check if the conversation exists.
	const { user } = useAuth();
	// const [recipientQuery, setRecipientQuery] = useState("")
	// const [newMessageOpen, setNewMessageOpen] = useState(false)
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<InboxFilter>("all");
	const [draft, setDraft] = useState("");
	const creatingForUserRef = useRef<string | null>(null);

	const { sendMessage, setMessageSendResult, setActiveConversationId } = useWebSocket();
	const role = useAccountRole();
	const clientMode = role === "client";
	const { conversations, profiles } = useChatData(role as "client" | "freelancer");
	const createConversation = useCreateConversation(role as "client" | "freelancer");
	const MessageUpdate = useConversationUpdate();
	const selectedConversation = SelectedUserId
		? conversations.data?.data.find(
			(conversation) => conversation.other_user?.id === SelectedUserId,
		)
		: undefined;
	const selectedConversationId =
		selectedConversation === undefined
			? selectedConversation
			: selectedConversation?.id;
	const selectedProfile =
		selectedConversation &&
		(profiles.data?.get(selectedConversation?.other_user?.id ?? "") ??
			(selectedConversation.other_user
				? createFallbackProfile(selectedConversation.other_user, selectedConversation.other_user_role)
				: undefined));
	const ids = useMemo(
		() => conversations?.data?.data.map((conversation) => conversation.other_user?.id ?? "").filter(Boolean) ?? [],
		[conversations?.data?.data],
	)
	const { isOnline, isPending: presencePending } = useUsersOnline(ids)
	// const { isOnline, isPending: presencePending } = useUserOnlineStatus(
	// 	selectedProfile?.user_id,
	// );
	const detailsQuery = useConversation(selectedConversationId ?? "");
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (
			conversations.isSuccess &&
			SelectedUserId &&
			!selectedConversation &&
			!createConversation.isPending &&
			creatingForUserRef.current !== SelectedUserId
		) {
			void createConversation
				.mutateAsync(SelectedUserId)
				.then((newConversation) => {
					onSelectContact(newConversation.other_user?.id ?? "");
				})
				.catch((error) => {
					console.error("Error creating conversation:", error);
					toast.error("Failed to create conversation. Please try again.");
				});
			creatingForUserRef.current = SelectedUserId;
		}
		// if (!SelectedUserId && conversations.data?.data[0]?.other_user?.id)
		// 	onSelectContact(conversations.data?.data[0]?.other_user?.id ?? "")
	}, [
		SelectedUserId,
		conversations.isSuccess,
		// creatingForUserRef,
		createConversation.isPending,
		selectedConversation,
	]);

	useEffect(() => {
		setActiveConversationId(selectedConversationId ?? null);
		return () => setActiveConversationId(null);
	}, [selectedConversationId, setActiveConversationId]);

	useEffect(() => {
		if (!selectedConversationId) return;

		const hasUnread =
			(selectedConversation?.unread_count ?? 0) > 0 ||
			detailsQuery.data?.messages?.some(
				(message) => message.sender_id !== user?.id && !message.is_read,
			);

		if (hasUnread) {
			sendMessage({
				type: "read_receipt",
				conversation_id: selectedConversationId,
			});

			// Mark messages received from the other user as read in the active conversation
			const cachedDetail = queryClient.getQueryData<ConversationDetailPublic>(
				chatKeys.conversation(selectedConversationId),
			);
			if (
				cachedDetail &&
				((cachedDetail.unread_count ?? 0) > 0 ||
					cachedDetail.messages?.some(
						(message) => message.sender_id !== user?.id && !message.is_read,
					))
			) {
				queryClient.setQueryData<ConversationDetailPublic>(
					chatKeys.conversation(selectedConversationId),
					(current) => {
						if (!current) return current;
						return {
							...current,
							unread_count: 0,
							messages: current.messages?.map((message) =>
								message.sender_id !== user?.id && !message.is_read
									? { ...message, is_read: true }
									: message,
							),
						};
					},
				);
			}

			// Clear unread count and mark last message as read in conversations list
			for (const [queryKey, queryData] of queryClient.getQueriesData<ConversationsPublic>({
				queryKey: [...chatKeys.all, "conversations"],
			})) {
				const matched = queryData?.data?.find(
					(conversation) => conversation.id === selectedConversationId,
				);
				if (!matched) continue;
				const needsRead =
					(matched.unread_count ?? 0) > 0 ||
					Boolean(
						matched.last_message &&
						matched.last_message.sender_id !== user?.id &&
						!matched.last_message.is_read,
					);
				if (!needsRead) continue;

				queryClient.setQueryData<ConversationsPublic>(queryKey, (current) => {
					if (!current?.data) return current;
					const index = current.data.findIndex(
						(conversation) => conversation.id === selectedConversationId,
					);
					if (index === -1) return current;

					const conversation = current.data[index];
					const lastMessageNeedsRead = Boolean(
						conversation.last_message &&
						conversation.last_message.sender_id !== user?.id &&
						!conversation.last_message.is_read,
					);
					if ((conversation.unread_count ?? 0) === 0 && !lastMessageNeedsRead) {
						return current;
					}

					const updatedConversations = [...current.data];
					updatedConversations[index] = {
						...conversation,
						unread_count: 0,
						last_message:
							lastMessageNeedsRead && conversation.last_message
								? {
									...conversation.last_message,
									is_read: true,
								}
								: conversation.last_message,
					};
					return {
						...current,
						data: updatedConversations,
					};
				});
			}
		}
	}, [
		selectedConversationId,
		selectedConversation?.unread_count,
		detailsQuery.data?.messages,
		user?.id,
		sendMessage,
		queryClient,
	]);

	useEffect(() => {
		detailsQuery.data?.messages?.forEach((message) =>
			setMessageSendResult(message.id, "sent"),
		);
	}, [selectedConversationId, detailsQuery.isPending]);
	if (conversations.isPending) {
		return <>Still loading conversations!</>;
	}

	const unreadCount = conversations.data?.data.reduce(
		(total, conversation) => total + (conversation.unread_count ?? 0),
		0,
	);

	const send = (message: string) => {
		const content = message.trim();
		const rmessage: ChatMessagePublic = {
			id: crypto.randomUUID(),
			conversation_id: selectedConversationId ?? "",
			content,
			sender_id: user?.id ?? "Me",
			created_at: new Date().toISOString(),
			is_read: false,
		};

		if (!selectedConversationId || !content) return;

		let sent = false;
		MessageUpdate(selectedConversationId, rmessage);

		// append the latest message to the conversations list, and set the unread count to 0 for this conversation.
		for (const [queryKey, queryData] of queryClient.getQueriesData<ConversationsPublic>({
			queryKey: [...chatKeys.all, "conversations"],
		})) {
			if (!queryData?.data?.some((c) => c.id === selectedConversationId)) continue;
			queryClient.setQueryData<ConversationsPublic>(queryKey, (current) => {
				if (!current?.data) return current;
				const index = current.data.findIndex(
					(conversation) => conversation.id === selectedConversationId,
				);
				if (index === -1) return current;

				const nextData = [...current.data];
				const [conversation] = nextData.splice(index, 1);
				nextData.unshift({
					...conversation,
					unread_count: 0,
					last_message: rmessage,
				});
				return {
					...current,
					data: nextData,
				};
			});
		}

		setMessageSendResult(rmessage.id, "pending");
		setDraft("");
		// setTimeout(() => {

		sent = sendMessage({
			type: "chat_message",
			conversation_id: selectedConversationId,
			content,
			client_message_id: rmessage.id,
		});
		if (!sent) {
			setMessageSendResult(rmessage.id, "failed");
			toast.error("Failed to send message. Please try again.");
		}
		// }, 1000) // Simulate a delay for sending the message
	};

	return (
		<div className="mx-auto w-full max-w-360 space-y-7 px-4 md:px-6">
			<WorkspacePageHeader
				eyebrow={clientMode ? "Client workspace" : "Freelancer workspace"}
				title="Messages"
				description={
					clientMode
						? "Connect with freelancers, discuss your brief, and keep your projects moving."
						: "Manage client conversations, share design artifacts, and collaborate on active contracts."
				}
				meta={
					<span className="flex items-center gap-1 font-medium text-link">
						<span className="size-1.5 rounded-full bg-primary-container dark:bg-primary" />
						{unreadCount ?? 0} unread{" "}
						{unreadCount === 1 ? "message" : "messages"}
					</span>
				}
				action=""
			/>
			{/* <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
				<DialogContent className="max-w-md border-outline-variant bg-surface-container-lowest">
					<DialogHeader>
						<DialogTitle className="font-headline-sm font-semibold text-headline-sm text-on-surface">
							New message
						</DialogTitle>
						<DialogDescription className="font-body-sm text-body-sm text-on-surface-variant">
							Choose a {clientMode ? "freelancer" : "client"} to start or continue a conversation.
						</DialogDescription>
					</DialogHeader>
					<div className="relative mt-2">
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
						<input
							aria-label="Find a recipient"
							value={recipientQuery}
							onChange={(e) => setRecipientQuery(e.target.value)}
							placeholder={clientMode ? "Search freelancers…" : "Search clients…"}
							className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-9 pr-3 font-body-sm text-body-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-outline focus:ring-1 focus:ring-outline"
						/>
					</div>
					<div className="max-h-64 space-y-1 overflow-y-auto pt-2">
						{matchingProfiles.map(([id, profile]) => {
							const theme = getClientTheme(id)
							const name = profile.full_name ?? "Unknown user"
							const subtitle = isClientProfile(profile)
								? (profile.company ?? profile.company_role ?? "Client")
								: (profile.title ?? "Freelancer")
							return (
								<button
									key={id}
									type="button"
									onClick={() => {
										onSelectContact(id)
										setNewMessageOpen(false)
									}}
									className="flex w-full items-center gap-3 rounded-lg border border-transparent p-2.5 text-left transition-colors hover:border-outline-variant hover:bg-surface-container-low"
								>
									<span
										className={cn(
											"grid size-9 shrink-0 place-items-center rounded-lg border font-label-sm font-semibold shadow-2xs",
											theme.bg,
											theme.text,
											theme.border,
										)}
									>
										{name.slice(0, 2).toUpperCase()}
									</span>
									<div className="min-w-0 flex-1">
										<span className="block truncate font-label-md font-semibold text-label-md text-on-surface">
											{name}
										</span>
										<span className="block truncate font-caption text-caption text-on-surface-variant">{subtitle}</span>
									</div>
								</button>
							)
						})}
						{matchingProfiles.length === 0 && (
							<p className="py-6 text-center font-body-sm text-body-sm text-on-surface-variant">No matching users.</p>
						)}
					</div>
				</DialogContent>
			</Dialog> */}
			<div className="messages-workspace grid h-[calc(100vh-14.5rem)] max-h-220 min-h-160 min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
				<ConversationList
					me={user}
					selected={selectedProfile}
					query={query}
					filter={filter}
					unreadCount={unreadCount ?? 0}
					onQueryChange={setQuery}
					onFilterChange={setFilter}
					onSelect={onSelectContact}
					conversations={conversations.data}
					profiles={profiles.data}
					isOnline={isOnline}
				/>
				{selectedConversationId && !selectedConversation ? (
					<section className="flex flex-col gap-4 p-6" aria-live="polite">
						<Alert>
							<AlertTitle>
								{profiles.isPending
									? "Loading freelancer…"
									: profiles.isError
										? "Couldn’t load freelancer"
										: "Freelancer unavailable"}
							</AlertTitle>
							<AlertDescription>
								{profiles.isPending
									? "Getting their profile details."
									: profiles.isError
										? "Please try loading the profile again."
										: profiles.data?.size === 0
											? "No public freelancer profiles are available yet. Once this freelancer’s profile is available, reload to start your conversation."
											: "This freelancer’s public profile could not be found. Check the contact link or try again later."}
							</AlertDescription>
						</Alert>
						{!profiles.isPending && (
							<button
								type="button"
								disabled={profiles.isFetching}
								onClick={() => void profiles.refetch()}
								className={`${workspaceStyles.secondaryAction} disabled:opacity-50`}
							>
								{profiles.isFetching ? "Loading…" : "Reload profile"}
							</button>
						)}
						<button
							type="button"
							onClick={() => onSelectContact("")}
							className={workspaceStyles.secondaryAction}
						>
							Back to conversations
						</button>
					</section>
				) : selectedConversationId !== undefined ? (
					<MessageThread
						key={selectedProfile?.user_id ?? "no-profile"}
						selected={selectedProfile}
						isOnline={isOnline(selectedProfile?.user_id ?? "")}
						presencePending={presencePending}
						messages={detailsQuery.data?.messages ?? []}
						draft={draft}
						onBack={() => {
							onSelectContact("");
						}}
						onOpenLatest={() => {
							if (conversations.data?.data[0]?.other_user?.id)
								onSelectContact(conversations.data?.data[0].other_user?.id);
							// else setNewMessageOpen(true)
						}}
						hasConversations={
							conversations.data?.count === undefined
								? false
								: conversations.data?.count > 0
						}
						canViewProfile={true}
						onDetails={() => {
							if (
								clientMode &&
								selectedProfile?.user_id
							)
								void navigate({
									to: "/talent/$freelancerId",
									params: { freelancerId: selectedProfile.user_id },
									search: { q: undefined },
								});
						}}
						onDraftChange={setDraft}
						onSend={() => send(draft)}
					/>
				) : (
					<EmptyState
						icon={InboxIcon}
						title="Select a conversation"
						description={`Choose a ${clientMode ? "freelancer" : "client"} from the list to view your conversation.`}
						className="h-full rounded-none border-0 bg-transparent"
					/>
				)}
			</div>
		</div>
	);
}
