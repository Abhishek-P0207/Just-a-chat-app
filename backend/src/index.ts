import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST'],
    }
})

app.get("/", (req, res) => {
    res.send("Hello World!");
});

io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    socket.on("message", (message) => {
        console.log(`You sent ${message}`);
        socket.send(`sent ${message}`);
    })

    socket.on("chat", (message) => {
        socket.broadcast.emit("chat", message);
    })
})

httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
})