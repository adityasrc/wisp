interface ConversationListProps {
    conversations: any[];
    selectedConversationId?: string;
    onSelectConversation: (convo: any) => void;
}

export function ConversationList({
    conversations,
    selectedConversationId,
    onSelectConversation,
}: ConversationListProps) {
    if (conversations.length === 0) {
        return <div>No conversations yet</div>;
    }

    return (
        <div>
            {conversations.map((convo) => (
                <div
                    key={convo.id}
                    onClick={() => onSelectConversation(convo)}
                    className={`cursor-pointer ${selectedConversationId === convo.id ? "font-bold" : "font-normal"}`}
                >
                    <div>{convo.partner?.username}</div>
                    <div>{convo.lastMessage?.content}</div>
                </div>
            ))}
        </div>
    );
}
