import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 5100,
  host: "0.0.0.0",
});

wss.on("listening", () => {
  console.log("WS listening on ws://localhost:5100");
});

wss.on("connection", function connection(socket) {
  console.log("client connected");
  socket.on("error", console.error);
  socket.send("anything");
});
