const API_BASE_URL = "http://localhost:3001";

// fetch wrapper to auto-attach cookies and handle json parsing
export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        // send auth cookies with cross-port requests
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json();

    // throw error message from backend if request failed
    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}
