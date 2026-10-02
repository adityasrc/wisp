import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/apiClient";

interface UserSearchProps {
    socket: WebSocket | null;
}

export function UserSearch({ socket }: UserSearchProps) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // debounced user search to prevent hitting api on every single keystroke
    useEffect(() => {
        const searchUsers = async () => {
            try {
                // only search if query has more than 2 chars
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

        // 400ms debounce timer
        const timer = setTimeout(() => {
            searchUsers();
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // send friend request through websocket so receiver gets real-time notification
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
