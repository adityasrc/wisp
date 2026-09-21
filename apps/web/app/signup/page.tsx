"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';


export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3001/api/v1/auth/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                }, body: JSON.stringify({
                    name,
                    username,
                    password
                })
            })

            const data = await response.json();
            if (response.ok) {
                router.push("/chats");
            } else {
                console.log(data.message);
            }

        } catch (err) {
            console.log("Signup Failed");
        }

    }

    return (
        <>
            <div>Signup Page</div>
            <br></br>

            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Enter your name</label>
                <br></br>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ankur Kashyap" />
                <br></br><br></br>
                <label htmlFor="username">Enter your username</label>
                <br></br>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ankurkashyap" />
                <br></br><br></br>
                <label htmlFor="password">Enter your password</label>
                <br></br>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                <br></br>
                <br></br>
                <button type="submit">Submit</button>

            </form>
        </>
    )
}