import { useState, useCallback } from "react";
import { apiClient } from "../../../lib/apiClient";

export function useMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState<string>("");

    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const data = await apiClient(`/api/v1/conversations/${conversationId}/messages`);
            // backend returns desc, reverse for chrono order
            setMessages((data.messages || []).reverse());
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    }, []);

    const sendMessage = useCallback((conversationId: string, socket: WebSocket | null, content: string) => {
        if (!socket || !content.trim()) return;

        socket.send(
            JSON.stringify({
                type: "message:send",
                payload: {
                    conversationId,
                    content: content.trim(),
                },
            })
        );
        setMessageText("");
    }, []);

    const appendMessage = useCallback((newMsg: any) => {
        setMessages((prev) => [...prev, newMsg]);
    }, []);

    return {
        messages,
        messageText,
        setMessageText,
        fetchMessages,
        sendMessage,
        appendMessage,
        setMessages,
    };
}
