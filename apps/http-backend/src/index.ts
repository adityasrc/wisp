import express from "express";
import cors from "cors";
const app = express();
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chats.js";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chats", chatRoutes);

app.use(errorMiddleware);

app.listen(3001, () => {
    console.log(`Http-backend running at ${3001}`);
});


