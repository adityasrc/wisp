interface MessageInputProps {
    messageText: string;
    setMessageText: (val: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
}

export function MessageInput({ messageText, setMessageText, onSendMessage }: MessageInputProps) {
    return (
        <form onSubmit={onSendMessage}>
            <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
            />
            <button type="submit">Send</button>
        </form>
    );
}
