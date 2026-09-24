interface MessageListProps {
    messages: any[];
    currentUserId?: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    if (messages.length === 0) {
        return <div>No messages yet. Say hi!</div>;
    }

    return (
        <div>
            {messages.map((msg) => {
                const isMe = msg.sender?.id === currentUserId;
                return (
                    <div key={msg.id}>
                        <span>{isMe ? "You" : msg.sender?.username}: </span>
                        <span>{msg.content}</span>
                    </div>
                );
            })}
        </div>
    );
}
