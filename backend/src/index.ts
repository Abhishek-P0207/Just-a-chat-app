import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import groupsRoutes from "./routes/groupRoutes.js";
import { saveMessage } from "./controllers/messageController.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// REST routes
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/groups", groupsRoutes);

app.get("/", (_req, res) => {
    res.send("Chat API running");
});

// --- Socket.IO ---
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

// Maps userId → socketId
const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Client sends userId after logging in
    socket.on("register", (userId: string) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
        io.emit("onlineUsers", Array.from(userSocketMap.keys()));
    });

    // Client sends { groupId, name, members } after creating a group
    socket.on("createGroup", ({ groupId, name, members }: {
        groupId: string;
        name: string;
        members: string[];
    }) => {
        console.log(`Group ${groupId} (${name}) created with members:`, members);

        // Make every online member's socket join the Socket.IO room for this group
        members.forEach((memberId) => {
            const memberSocketId = userSocketMap.get(memberId);
            if (memberSocketId) {
                const memberSocket = io.sockets.sockets.get(memberSocketId);
                memberSocket?.join(groupId);
            }
        });

        // Notify each member that they've been added to this group
        io.to(groupId).emit("joinGroup", { id: groupId, name, memberIds: members });
    });

    // DM: Client sends { convId, content, senderId, toUserId }
    socket.on("chat", async ({ convId, content, senderId, toUserId }: {
        convId: string;
        content: string;
        senderId: string;
        toUserId: string;
    }) => {
        try {
            const message = await saveMessage(convId, senderId, content);

            const receiverSocket = userSocketMap.get(toUserId);
            if (receiverSocket) {
                io.to(receiverSocket).emit("chat", message);
            }

            // Echo to sender
            socket.emit("chat", message);
        } catch (err) {
            console.error("Error saving message:", err);
            socket.emit("error", "Failed to send message.");
        }
    });

    // Group chat: Client sends { convId, content, senderId }
    socket.on("group-chat", async ({ convId, content, senderId }: {
        convId: string;
        content: string;
        senderId: string;
    }) => {
        try {
            const message = await saveMessage(convId, senderId, content);

            // Broadcast to all members in the room (includes sender's socket)
            io.to(convId).emit("group-chat", message);
        } catch (err) {
            console.error("Error saving group message:", err);
            socket.emit("error", "Failed to send group message.");
        }
    });

    socket.on("disconnect", () => {
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