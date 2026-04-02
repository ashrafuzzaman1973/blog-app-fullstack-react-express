const express = require('express');
const router = express.Router();
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
router.post('/', (req, res) => {
    const { title, email, description } = req.body;

    // Validation: Require at least Title and Description
    if (!title || !description) {
        return res.status(400).json({ message: "Title and Description are required" });
    }

    const blogs = readData(FILE) || [];

    const newBlog = {
        id: Date.now(),
        title: title,
        email: email || "N/A", // Save email or "N/A" if empty
        description: description
    };

    blogs.push(newBlog);

    try {
        writeData(FILE, blogs);
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(500).json({ message: "Error saving to file" });
    }
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