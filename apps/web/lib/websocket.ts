import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
    user: any;
    onMessageNew?: (message: any) => void;
    onRequestReceived?: (request: any) => void;
    onRequestAccepted?: () => void;
    onError?: (error: string) => void;
}

export function useWebSocket({
    user,
    onMessageNew,
    onRequestReceived,
    onRequestAccepted,
    onError,
}: UseWebSocketOptions) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    // refs avoid stale closures in socket event handlers
    const handlersRef = useRef({
        onMessageNew,
        onRequestReceived,
        onRequestAccepted,
        onError,
    });

    useEffect(() => {
        handlersRef.current = {
            onMessageNew,
            onRequestReceived,
            onRequestAccepted,
            onError,
        };
    });

    useEffect(() => {
        if (!user) return;

        const ws = new WebSocket("ws://localhost:5100");

        ws.onopen = () => {
            console.log("WS connected!");
            setSocket(ws);
        };

        ws.onerror = (err) => {
            console.error("WS error: ", err);
        };

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                console.log("WS message received", data);

                if (data.type === "message:new") {
                    handlersRef.current.onMessageNew?.(data.payload);
                } else if (data.type === "request:received") {
                    handlersRef.current.onRequestReceived?.(data.payload);
                } else if (data.type === "request:accepted") {
                    handlersRef.current.onRequestAccepted?.();
                } else if (data.type === "error") {
                    handlersRef.current.onError?.(data.payload?.message || "Something went wrong");
                }
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };

        return () => {
            ws.close();
        };
    }, [user]);

    return { socket };
}
