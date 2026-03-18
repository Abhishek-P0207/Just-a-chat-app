import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import { saveMessage } from "./controllers/messageController.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: "http://localhost:5174" }));
app.use(express.json());

// REST routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

app.get("/", (_req, res) => {
    res.send("Chat API running");
});

// --- Socket.IO ---
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5174",
        methods: ["GET", "POST"],
    },
});

// Maps userId → socketId so we can deliver messages to online users
const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Client sends { userId } after logging in
    socket.on("register", (userId: string) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);

        // Broadcast updated online user list to everyone
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });

    // Client sends { convId, content, senderId, toUserId }
    socket.on("chat", async ({ convId, content, senderId, toUserId }: {
        convId: string;
        content: string;
        senderId: string;
        toUserId: string;
    }) => {
        try {
            // Persist to DB
            const message = await saveMessage(convId, senderId, content);

            // Deliver to recipient if online
            const receiverSocket = userSocketMap.get(toUserId);
            if (receiverSocket) {
                io.to(receiverSocket).emit("chat", message);
            }

            // Echo back to sender so they get the persisted message object
            socket.emit("chat", message);
        } catch (err) {
            console.error("Error saving message:", err);
            socket.emit("error", "Failed to send message.");
        }
    });

    socket.on("disconnect", () => {
        // Remove socket from map
        for (const [userId, sid] of userSocketMap.entries()) {
            if (sid === socket.id) {
                userSocketMap.delete(userId);
                console.log(`User ${userId} disconnected.`);
                break;
            }
        }
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });
});

httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
});