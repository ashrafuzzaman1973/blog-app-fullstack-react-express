const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: { type: String, default: 'global_chat' },
    author: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);