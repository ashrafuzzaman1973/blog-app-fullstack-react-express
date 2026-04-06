const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('multer'); // Wait, this should be 'path'
const pathNode = require('path');
const jwt = require('jsonwebtoken'); // CRITICAL: Added this
const { readData, writeData } = require('../utils/fileHandler');

const FILE = './data/blogs.json';
const SECRET_KEY = "abcdefg"; // Must match auth.js

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Bearer <token>

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Adds user info (id, email) to the request object
        next();
    } catch (err) {
        res.status(401).json({ message: "Unauthorized / Session Expired" });
    }
};

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + pathNode.extname(file.originalname));
    }
});

const upload = multer({ storage });

// --- ROUTES ---

// GET: Publicly fetch all blogs
router.get('/', (req, res) => {
    try {
        const data = readData(FILE);
        res.status(200).json(data || []);
    } catch (error) {
        res.status(500).json({ message: "Error reading data" });
    }
});

// POST: Protected route to create a blog
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: "Title and Description are required" });
    }

    const blogs = readData(FILE) || [];

    const newBlog = {
        id: Date.now(),
        title,
        // PRO TIP: Use req.user.email from the token instead of trusting req.body.email
        email: req.user.email,
        description,
        imageUrl: req.file ? `http://localhost:8000/uploads/${req.file.filename}` : null
    };

    blogs.push(newBlog);

    try {
        writeData(FILE, blogs);
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ message: "Error saving blog" });
    }
});

// DELETE: Protected route to remove a blog
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    let blogs = readData(FILE);

    const initialLength = blogs.length;
    // Basic protection: You could also check if blogs[index].email === req.user.email
    // to ensure users only delete their OWN posts.
    blogs = blogs.filter(b => b.id != id);

    if (blogs.length === initialLength) {
        return res.status(404).json({ message: "Blog not found" });
    }

    try {
        writeData(FILE, blogs);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Error deleting data" });
    }
});

module.exports = router;