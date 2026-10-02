import { useState, useCallback } from "react";
import { apiClient } from "../../../lib/apiClient";

export function useConversations() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);

    // load conversations list for sidebar
    const fetchConversation = useCallback(async () => {
        try {
            const data = await apiClient("/api/v1/conversations");
            setConversations(data.conversations || []);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    }, []);

    // update message preview snippet in sidebar when new message arrives
    const updateLastMessage = useCallback((conversationId: string, content: string) => {
        setConversations((prev) =>
            prev.map((convo) =>
                convo.id === conversationId
                    ? { ...convo, lastMessage: { content } }
                    : convo
            )
        );
    }, []);

    return {
        conversations,
        selectedConversation,
        setSelectedConversation,
        fetchConversation,
        updateLastMessage,
    };
}
