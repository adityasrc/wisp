import { useState, useCallback } from "react";
import { apiClient } from "../../../lib/apiClient";

export function useRequests(onConversationCreated?: () => void) {
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

    const fetchIncomingRequests = useCallback(async () => {
        try {
            const data = await apiClient("/api/v1/requests/incoming");
            setIncomingRequests(data.request || []);
        } catch (err) {
            console.error("Failed to fetch incoming requests", err);
        }
    }, []);

    const acceptRequest = useCallback(async (requestId: string) => {
        try {
            await apiClient(`/api/v1/requests/${requestId}/accept`, { method: "POST" });
            await fetchIncomingRequests();
            if (onConversationCreated) {
                await onConversationCreated();
            }
        } catch (err: any) {
            alert(err.message || "Failed to accept request");
        }
    }, [fetchIncomingRequests, onConversationCreated]);

    const rejectRequest = useCallback(async (requestId: string) => {
        try {
            await apiClient(`/api/v1/requests/${requestId}/reject`, { method: "POST" });
            await fetchIncomingRequests();
        } catch (err: any) {
            alert(err.message || "Failed to reject request");
        }
    }, [fetchIncomingRequests]);

    const addIncomingRequest = useCallback((request: any) => {
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
