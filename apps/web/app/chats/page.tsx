"use client";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";

export default function Chats() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResult, setSearchResult] = useState<any[]>([]);

    useEffect(() => {
        const searchUsers = async () => {
            try {
                if (searchQuery.length > 2) {
                    const response = await fetch("http://localhost:3001/api/v1/users/search?q=" + searchQuery, {
                        method: "GET",
                        credentials: "include",
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSearchResult(data.users);
                    }
                } else {
                    setSearchResult([]);
                }
            } catch (err) {
                console.log("Search failed", err);
            }
        };

        const timer = setTimeout(() => {
            searchUsers();
        }, 400);
        return () => clearTimeout(timer);

    }, [searchQuery]);

    const fetchConversation = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/v1/conversations", {
                method: "GET",
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations);
            }
        } catch (err) {
            console.log("Failed to fetch conversations", err);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:3001/api/v1/users/me", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    router.push("/login");
                    return;
                }
                const data = await response.json();
                setUser(data.user);
                await fetchConversation();
                setLoading(false);

            } catch (err) {
                console.log("Auth Check Failed");
                router.push("/login");
            }
        };
        checkAuth();
    }, [])

    if (loading) {
        return <div>Loading...</div>;
    }

    function displayConversations() {
        return conversations.map((convo) =>
            <div key={convo.id}>
                <div>{convo.partner?.username}</div>
                <div>{convo.lastMessage?.content}</div>
            </div>
        )
    }

    function displaySearchResult() {
        return searchResult.map((user) =>
            <div key={user.id}>
                <div>{user.username}</div>
                <button>Say Hi</button>
            </div>
        )
    }

    return (
        <>
            <div> Chats Page </div>

            <div>{user.username}</div>
            <br></br>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find someone talk to" />
            {searchResult.length > 0 ? displaySearchResult() : "No results found"}
            <br></br>
            {conversations.length === 0 ? "No conversations yet" : displayConversations()}

        </>
    )
}