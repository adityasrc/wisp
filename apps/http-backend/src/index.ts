import express from "express";
const app = express();
import authRoutes from "./routes/auth.js"
import roomRoutes from "./routes/room.js"

app.use("/v1/api/auth", authRoutes);
app.use("v1/api/rooms", roomRoutes)

app.listen(3001, ()=> {
    console.log(`Http-backend running at ${3001}`);
});