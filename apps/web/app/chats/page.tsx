"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/apiClient";
import { useWebSocket } from "../../lib/websocket";
import { useConversations } from "../../features/chat/hooks/useConversations";
import { useMessages } from "../../features/chat/hooks/useMessages";
import { useRequests } from "../../features/requests/hooks/useRequests";
import { ConversationList } from "../../features/chat/components/ConversationList";
import { MessageList } from "../../features/chat/components/MessageList";
import { MessageInput } from "../../features/chat/components/MessageInput";
import { RequestsList } from "../../features/requests/components/RequestsList";
import { UserSearch } from "../../features/search/components/UserSearch";

export default function Chats() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);

    // sidebar conversation state and helpers
    const {
        conversations,
        selectedConversation,
        setSelectedConversation,
        fetchConversation,
        updateLastMessage,
    } = useConversations();

    // active chat messages and send handler
    const {
        messages,
        messageText,
        setMessageText,
        fetchMessages,
        sendMessage,
        appendMessage,
    } = useMessages();

    // friend requests hook, pass fetchConversation so accepting auto-updates chat list
    const {
        incomingRequests,
        fetchIncomingRequests,
        acceptRequest,
        rejectRequest,
        addIncomingRequest,
    } = useRequests(fetchConversation);

    // real-time ws listeners wired to our hook actions
    const { socket } = useWebSocket({
        user,
        onMessageNew: (newMsg) => {
            // append message only if it belongs to currently open chat
            if (newMsg.conversationId === selectedConversation?.id) {
                appendMessage(newMsg);
            }
            // update preview snippet in sidebar
            updateLastMessage(newMsg.conversationId, newMsg.content);
        },
        onRequestReceived: (req) => {
            // someone sent us a request, show in incoming list
            addIncomingRequest(req);
        },
        onRequestAccepted: () => {
            // request accepted, refresh both requests and conversation list
            fetchConversation();
            fetchIncomingRequests();
        },
        onError: (err) => alert(err),
    });

    // auth check on mount, redirect to login if session cookie is missing or invalid
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const data = await apiClient("/api/v1/users/me");
                setUser(data.user);
                // parallel fetch to avoid network waterfall
                await Promise.all([fetchConversation(), fetchIncomingRequests()]);
                setLoading(false);
            } catch {
                router.push("/login");
            }
        };
        checkAuth();
    }, [router, fetchConversation, fetchIncomingRequests]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div> Chats Page </div>

            <div>{user?.username}</div>
            <br />

            <UserSearch socket={socket} />

            <RequestsList
                requests={incomingRequests}
                onAccept={(id) => acceptRequest(id, socket)}
                onReject={(id) => rejectRequest(id, socket)}
            />

            <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={(convo) => {
                    setSelectedConversation(convo);
                    fetchMessages(convo.id);
                }}
            />

            {selectedConversation && (
                <div>
                    <br />
                    <hr />
                    <h3>Active Chat: {selectedConversation.partner?.username}</h3>
                    <MessageList messages={messages} currentUserId={user?.id} />
                    <br />
                    <MessageInput
                        messageText={messageText}
                        setMessageText={setMessageText}
                        onSendMessage={(e) => {
                            e.preventDefault();
                            sendMessage(selectedConversation.id, socket, messageText);
                        }}
                    />
                </div>
            )}
        </>
    );
}