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
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.NODE_ENV === 'production'
    ? "https://blog-app-fullstack-react-express.vercel.app"
    : "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// --- 🚀 IMPORTANT: SHARE SOCKET.IO WITH ROUTES ---
// This allows you to use req.app.get('socketio') in your blogRoutes.js
app.set('socketio', io);

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

    // 1. Handle online status
    socket.on("user_online", (email) => {
        if (email) {
            activeUsers.set(socket.id, email);
            const uniqueEmails = Array.from(new Set(activeUsers.values()));
            io.emit("user_list", uniqueEmails);
        }
    });

    // 2. Private Chat Logic
    socket.on("join_private_room", async ({ senderEmail, receiverEmail }) => {
        const room = [senderEmail, receiverEmail].sort().join("_");
        socket.join(room);

        try {
            const history = await Message.find({ room }).sort({ createdAt: 1 }).limit(100);
            socket.emit("chat_history", history);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    });

    socket.on("send_message", async (data) => {
        try {
            const { room, author, message, time } = data;
            const newMessage = new Message({ room, author, message, time });
            await newMessage.save();
            socket.to(room).emit("receive_message", data);
        } catch (err) {
            console.error("Error saving message:", err);
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
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));