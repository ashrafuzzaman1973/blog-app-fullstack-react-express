const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure this path is correct

const SECRET_KEY = "abcdefg"; // Pro-tip: Move this to your .env file

// SIGN UP (Using MongoDB)
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error during signup", error: err.message });
    }
});

// LOG IN (Updated to use MongoDB)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user in MongoDB instead of JSON file
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create token using MongoDB's _id
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token, email: user.email });
    } catch (err) {
        res.status(500).json({ message: "Server error during login", error: err.message });
    }
});

// VERIFY TOKEN (On page load)
router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "Not logged in" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Optional: Check if user still exists in DB
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) return res.status(401).json({ message: "User no longer exists" });

        res.json({ email: user.email, valid: true });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired session" });
    }
});

module.exports = router;