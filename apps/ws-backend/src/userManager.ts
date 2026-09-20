import { WebSocket } from "ws";
import type { ServerMessage } from "./types.js";

export class UserManager {
    // track active sockets per user: userId
    private users: Map<string, Set<WebSocket>> = new Map();

    addUser(userId: string, socket: WebSocket) {
        let userSockets = this.users.get(userId);
        if (!userSockets) {
            userSockets = new Set();
            this.users.set(userId, userSockets);
        }

        userSockets.add(socket);
    }

    removeUser(userId: string, socket: WebSocket) {
        const userSockets = this.users.get(userId);
        if (userSockets) {
            userSockets.delete(socket);

            // if user closed all connections, remove userId to free memory
            if (userSockets.size === 0) {
                this.users.delete(userId);
            }
        }
    }

    sendToUser(userId: string, message: ServerMessage) {
        const userSockets = this.users.get(userId);
        if (!userSockets) return;

        const data = JSON.stringify(message);

        userSockets.forEach(socket => {
            // only send if socket connection is still open
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data);
            }
        });
    }

    broadcastToUsers(userIds: string[], message: ServerMessage) {
        userIds.forEach(userId => {
            this.sendToUser(userId, message);
        });
    }

    isUserOnline(userId: string): boolean {
        return this.users.has(userId);
    }
}

// single instance shared across the entire server
export const userManager = new UserManager();