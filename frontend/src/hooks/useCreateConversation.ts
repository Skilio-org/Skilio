import { ChatService, ConversationsPublic } from "@/client";
import { chatKeys } from "@/data/chat-keys";
import { useQueryClient } from "@tanstack/react-query";

export async function useCreateConversation(userid: string) 
{
    
    const queryClient = useQueryClient()
    const current = queryClient.getQueryData<ConversationsPublic>(chatKeys.conversations())

    const response = await ChatService.createOrGetConversation({ body: { freelancer_id: userid }});
    if (response != undefined && response.status == 200)
    {
        queryClient.setQueryData<ConversationsPublic>(chatKeys.conversations(), {
            count: current?.count ?? 0 + 1,
            data: [...(current?.data ?? []), response.data]
        })
    }
    return response.data;
}