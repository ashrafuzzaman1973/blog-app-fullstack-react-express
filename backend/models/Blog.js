const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String },
    tags: [String], // Array of strings for SEO
    comments: [
        {
            email: String,
            text: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', blogSchema);