"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';


export default function Signup() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        setLoading(true)
        setError("");
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3001/api/v1/auth/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({
                    username,
                    password
                })
            })

            const data = await response.json();
            if (response.ok) {
                router.push("/chats");
            } else {
                console.log(data.message);
                setError(data.message)
            }

        } catch (err) {
            console.log("Signup Failed");
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }

    }

    return (
        <>
            <div>Signup Page</div>
            <br></br>

            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Enter your username</label>
                <br></br>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ankurkashyap" />
                <br></br><br></br>
                <label htmlFor="password">Enter your password</label>
                <br></br>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                <br></br>
                <br></br>
                {error && <p>{error}</p>}
                <button type="submit" disabled={loading}>{loading ? "Creating Account..." : "Sign up"}</button>

            </form>
        </>
    )
}