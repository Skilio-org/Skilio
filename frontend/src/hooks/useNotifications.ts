import { NotificationsService } from "@/client";
import { chatKeys } from "@/data/chat-keys";
import { useQuery, type QueryFunctionContext } from "@tanstack/react-query"

async function getMyNotifications({ signal }: QueryFunctionContext) {
	const response = await NotificationsService.getMyNotifications({ signal });
	return response.data;
}

export function useNotifications() {
	return useQuery({
		queryKey: chatKeys.notifications(),
		queryFn: getMyNotifications
	});
}