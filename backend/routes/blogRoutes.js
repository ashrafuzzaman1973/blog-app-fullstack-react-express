const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readData, writeData } = require('../utils/fileHandler');

const FILE = './data/blogs.json';
// GET: Fetch all blogs
router.get('/', (req, res) => {
    try {
        const data = readData(FILE);
        res.status(200).json(data || []);
    } catch (error) {
        res.status(500).json({ message: "Error reading data" });
    }
});

// POST: Save all fields
// Configure where to store uploaded images
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// POST: Handle Text + Image
router.post('/', upload.single('image'), (req, res) => {
    const { title, email, description } = req.body;
    const blogs = readData(FILE) || [];

    const newBlog = {
        id: Date.now(),
        title,
        email,
        description,
        // Save the URL path to the image
        imageUrl: req.file ? `http://localhost:8000/uploads/${req.file.filename}` : null
    };

    blogs.push(newBlog);
    writeData(FILE, blogs);
    res.status(201).json(newBlog);
});

// DELETE: Remove a blog by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    let blogs = readData(FILE);

    const initialLength = blogs.length;
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