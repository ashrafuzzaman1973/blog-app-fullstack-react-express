const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/fileHandler');

const FILE = './data/blogs.json';

// GET
router.get('/', (req, res) => {
    res.json(readData(FILE));
});

// POST
router.post('/', (req, res) => {
    const blogs = readData(FILE);

    const newBlog = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content
    };

    blogs.push(newBlog);
    writeData(FILE, blogs);

    res.json(newBlog);
});

// DELETE
router.delete('/:id', (req, res) => {
    let blogs = readData(FILE);
    blogs = blogs.filter(b => b.id != req.params.id);

    writeData(FILE, blogs);
    res.json({ message: 'Deleted' });
});

module.exports = router;