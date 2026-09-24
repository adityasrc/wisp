import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/apiClient";

interface UserSearchProps {
    socket: WebSocket | null;
}

export function UserSearch({ socket }: UserSearchProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const searchUsers = async () => {
            try {
                if (searchQuery.length > 2) {
                    const data = await apiClient(`/api/v1/users/search?q=${searchQuery}`);
                    setSearchResults(data.users || []);
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error("Search failed", err);
            }
        };

        const timer = setTimeout(() => {
            searchUsers();
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSendRequest = (username: string) => {
        if (!socket) {
            alert("Connecting to chat server, please wait...");
            return;
        }

        socket.send(
            JSON.stringify({
                type: "request:send",
                payload: {
                    username: username,
                    message: "Hi!",
                },
            })
        );
        alert(`Request sent to @${username}!`);
    };

    return (
        <div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find someone talk to"
            />
            <br />
            {searchQuery.length > 2 &&
                (searchResults.length > 0 ? (
                    searchResults.map((user) => (
                        <div key={user.id}>
                            <div>{user.username}</div>
                            <button onClick={() => handleSendRequest(user.username)}>Say Hi</button>
                        </div>
                    ))
                ) : (
                    "No results found"
                ))}
            <br />
        </div>
    );
}
