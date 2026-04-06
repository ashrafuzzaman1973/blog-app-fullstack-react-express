const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../utils/fileHandler');

const USER_FILE = './data/users.json';
const SECRET_KEY = "abcdefg"; // In production, use env variables

// SIGN UP
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const users = readData(USER_FILE) || [];

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), email, password: hashedPassword };

    users.push(newUser);
    writeData(USER_FILE, users);
    res.status(201).json({ message: "User created" });
});

// LOG IN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readData(USER_FILE) || [];
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, email: user.email });
});

// Add this to auth.js to verify the token on page load
router.get('/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "Not logged in" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ email: decoded.email, valid: true });
    } catch (err) {
        res.status(401).json({ message: "Invalid session" });
    }
});

module.exports = router;