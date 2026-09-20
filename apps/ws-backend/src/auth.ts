import "dotenv/config";
import { jwtVerify } from "jose";
import type { IncomingMessage } from "node:http";

// helper to extract token from Cookie header
function getCookieToken(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/token=([^;]+)/);
    return match && match[1] ? decodeURIComponent(match[1]) : null;
}


export async function authenticateSocket(req: IncomingMessage): Promise<string | null> {
    try {
        // try reading token from cookies (browser flow)
        let token = getCookieToken(req.headers.cookie);

        // fallback to query param
        if (!token && req.url) {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            token = parsedUrl.searchParams.get("token");
        }

        if (!token) {
            return null;
        }

        // jose needs secret as Uint8Array (bytes), not a plain string
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // validate that payload.sub exists and is a string
        if (!payload.sub || typeof payload.sub !== "string") {
            return null;
        }

        return payload.sub;
    } catch (err) {
        console.log("WS Auth Error:", err);
        return null;
    }
}