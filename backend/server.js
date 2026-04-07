require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogRoutes');
const Message = require('./models/Message');
const aiRoutes = require('./routes/aiRoutes'); // 1. Import the new route

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Map socket.id to user email
const activeUsers = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);

// Socket Logic
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 1. Handle user joining and updating online list
    socket.on("user_online", (email) => {
        if (email) {
            activeUsers.set(socket.id, email);
            const uniqueEmails = Array.from(new Set(activeUsers.values()));
            io.emit("user_list", uniqueEmails); // Tell everyone who is online
        }
    });

    // 2. Join a Private Room between two specific users
    socket.on("join_private_room", async ({ senderEmail, receiverEmail }) => {
        // Create a unique room ID by sorting emails alphabetically
        // This ensures both users join "ashraf_siddik" and not "siddik_ashraf"
        const room = [senderEmail, receiverEmail].sort().join("_");

        socket.join(room);
        console.log(`User ${senderEmail} joined private room: ${room}`);

        try {
            // Fetch history for this specific private conversation
            const history = await Message.find({ room }).sort({ createdAt: 1 }).limit(100);
            socket.emit("chat_history", history);
        } catch (err) {
            console.error("Error fetching private history:", err);
        }
    });

    // 3. Handle sending messages to a specific room
    socket.on("send_message", async (data) => {
        try {
            const { room, author, message, time } = data;

            const newMessage = new Message({ room, author, message, time });
            await newMessage.save();

            // Emit specifically to the room (private chat)
            socket.to(room).emit("receive_message", data);
        } catch (err) {
            console.error("Error saving private message:", err);
        }
    });

    socket.on("disconnect", () => {
        activeUsers.delete(socket.id);
        const uniqueEmails = Array.from(new Set(activeUsers.values()));
        io.emit("user_list", uniqueEmails);
        console.log(`User Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Private Chat Server running on port ${PORT}`));