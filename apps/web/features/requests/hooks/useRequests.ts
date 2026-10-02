import { useState, useCallback } from "react";
import { apiClient } from "../../../lib/apiClient";

export interface IncomingRequest {
    id: string;
    message?: string | null;
    createdAt: string;
    sender: {
        id: string;
        username: string;
    };
}

// onConversationCreated is called after accepting a request to refresh the sidebar chats
export function useRequests(onConversationCreated?: () => void) {
    const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);

    // fetch all pending requests received by this user
    const fetchIncomingRequests = useCallback(async () => {
        try {
            const data = await apiClient<{ request: IncomingRequest[] }>("/api/v1/requests/incoming");
            setIncomingRequests(data.request || []);
        } catch (err) {
            console.error("Failed to fetch incoming requests", err);
        }
    }, []);

    // accept request over websocket so both users get real-time request:accepted event
    const acceptRequest = useCallback((requestId: string, socket: WebSocket | null) => {
        if (!socket) return;

        socket.send(
            JSON.stringify({
                type: "request:respond",
                payload: {
                    requestId,
                    action: "ACCEPT",
                },
            })
        );

        // remove accepted request from incoming list
        setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId));

        if (onConversationCreated) {
            onConversationCreated();
        }
    }, [onConversationCreated]);

    // reject request over websocket
    const rejectRequest = useCallback((requestId: string, socket: WebSocket | null) => {
        if (!socket) return;

        socket.send(
            JSON.stringify({
                type: "request:respond",
                payload: {
                    requestId,
                    action: "REJECT",
                },
            })
        );

        // remove rejected request from incoming list
        setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId));
    }, []);

    // add live incoming request pushed over websocket
    const addIncomingRequest = useCallback((request: IncomingRequest) => {
        setIncomingRequests((prev) => [...prev, request]);
    }, []);

    return {
        incomingRequests,
        fetchIncomingRequests,
        acceptRequest,
        rejectRequest,
        addIncomingRequest,
    };
}
