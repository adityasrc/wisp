interface RequestsListProps {
    requests: any[];
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

export function RequestsList({ requests, onAccept, onReject }: RequestsListProps) {
    if (requests.length === 0) {
        return null;
    }

    return (
        <div>
            <div>Incoming Requests ({requests.length})</div>
            {requests.map((req) => (
                <div key={req.id}>
                    <span>{req.sender?.username}: </span>
                    <span>"{req.message || "Hi!"}" </span>
                    <button onClick={() => onAccept(req.id)}>Accept</button>
                    <button onClick={() => onReject(req.id)}>Reject</button>
                </div>
            ))}
            <br />
        </div>
    );
}
