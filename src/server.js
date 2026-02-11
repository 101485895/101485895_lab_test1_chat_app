const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const authRoutes = require("./routes/auth");
const GroupMessage = require("./models/GroupMessage");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "..", "public")));
app.use("/view", express.static(path.join(__dirname, "..", "view")));
app.use("/api", authRoutes);

app.get("/", (req, res) => res.send("testing testing"));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err.message));

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", ({ room, username }) => {
        socket.join(room);
        console.log(`${username} joined ${room}`);
    });

    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`left room: ${room}`);
    });

    socket.on("groupMessage", async (data) => {
        try {
        const { room, from_user, message } = data;

        await GroupMessage.create({ room, from_user, message });

        io.to(room).emit("groupMessage", data);
        } catch (err) {
        console.error("groupMessage error:", err.message);
        }
    });

    socket.on("joinRoom", async ({ room, username }) => {
    socket.join(room);

    const history = await GroupMessage.find({ room })
        .sort({ date_sent: 1 })
        .limit(50)
        .lean();
    socket.emit("roomHistory", history);

    });
    socket.on("typing", ({ room, username }) => {
        socket.to(room).emit("typing", { username });
    });

    socket.on("stopTyping", ({ room, username }) => {
        socket.to(room).emit("stopTyping", { username });
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));