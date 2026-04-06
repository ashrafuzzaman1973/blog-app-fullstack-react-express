const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Fixed: was requiring multer twice before
const jwt = require('jsonwebtoken');
const Blog = require('../models/Blog');

const SECRET_KEY = "abcdefg";

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized / Session Expired" });
    }
};

// Multer Storage
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. GET ALL BLOGS
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching blogs" });
    }
});

// 2. POST A BLOG
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { title, description } = req.body;

    try {
        const newBlog = new Blog({
            title,
            description,
            email: req.user.email,
            imageUrl: req.file ? `http://localhost:8000/uploads/${req.file.filename}` : null
        });

        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (err) {
        res.status(500).json({ message: "Error saving to MongoDB" });
    }
});

// 3. DELETE A BLOG (Updated for MongoDB)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const blogId = req.params.id;

        // Find the blog first to check ownership
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if the user trying to delete is the one who posted it
        if (blog.email !== req.user.email) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Blog.findByIdAndDelete(blogId);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting from MongoDB", error: error.message });
    }
});

module.exports = router;