import { authenticateSocket } from "./auth.js";
import { WebSocketServer } from "ws";
import { userManager } from "./userManager.js";
import { CLIENT_EVENTS, SERVER_EVENTS } from "./event.js";
import type { ClientMessage } from "./types.js";
import {
  sendMessageSchema,
  editWsMessageSchema,
  sendRequestSchema,
  respondRequestSchema,
} from "@repo/common";
import { handleEditMessage, handleSendMessage } from "./handlers/messageHandlers.js";
import { handleRespondRequest, handleSendRequest } from "./handlers/requestHandlers.js";

const wss = new WebSocketServer({
  port: 5100,
  host: "0.0.0.0",
});

wss.on("listening", () => {
  console.log("WS listening on ws://localhost:5100");
});

wss.on("connection", async function connection(socket, req) {
  socket.on("error", console.error);

  const userId = await authenticateSocket(req);
  if (!userId) {
    socket.close(4001, "Unauthorized");
    return;
  }

  userManager.addUser(userId, socket);

  socket.on("message", async (data) => {
    try {
      // parsing binary bytes(buffer) to string
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case CLIENT_EVENTS.MESSAGE_SEND: {

          const parsed = sendMessageSchema.safeParse(message.payload);
          if (!parsed.success) {
            userManager.sendToUser(userId, {
              type: SERVER_EVENTS.ERROR,
              payload: { message: parsed.error.issues[0]?.message || "Invalid message payload" }
            });
            return;
          }

          await handleSendMessage(userId, parsed.data);
          break;
        }

        case CLIENT_EVENTS.MESSAGE_EDIT: {
          const parsed = editWsMessageSchema.safeParse(message.payload);
          if (!parsed.success) {
            userManager.sendToUser(userId, {
              type: SERVER_EVENTS.ERROR,
              payload: { message: parsed.error.issues[0]?.message || "Invalid edit payload" }
            });
            return;
          }

          await handleEditMessage(userId, parsed.data);
          break;
        }

        case CLIENT_EVENTS.REQUEST_SEND: {
          const parsed = sendRequestSchema.safeParse(message.payload);
          if (!parsed.success) {
            userManager.sendToUser(userId, {
              type: SERVER_EVENTS.ERROR,
              payload: { message: parsed.error.issues[0]?.message || "Invalid request payload" }
            });
            return;
          }

          await handleSendRequest(userId, parsed.data);
          break;
        }

        case CLIENT_EVENTS.REQUEST_RESPOND: {
          const parsed = respondRequestSchema.safeParse(message.payload);
          if (!parsed.success) {
            userManager.sendToUser(userId, {
              type: SERVER_EVENTS.ERROR,
              payload: { message: parsed.error.issues[0]?.message || "Invalid respond payload" }
            });
            return;
          }

          await handleRespondRequest(userId, parsed.data);
          break;
        }

        default:
          console.log("Unknown event type:", (message as any).type);
      }
    } catch (err) {
      console.error("Invalid message format:", err);
      userManager.sendToUser(userId, {
        type: SERVER_EVENTS.ERROR,
        payload: { message: "Invalid JSON format" }
      });
    }
  });

  socket.on("close", () => {
    userManager.removeUser(userId, socket);
  });
});
