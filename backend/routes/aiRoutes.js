const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post("/generate_full_post", async (req, res) => {
    try {
        const { title } = req.body;

        const data = JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": `Write a 100-word blog description for: "${title}"`
                }]
            }]
        });

        const config = {
            method: 'post',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', // FIXED NAME
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            data: data
        };

        const response = await axios.request(config);

        // Extracting text from Google's response structure
        const generatedText = response.data.candidates[0].content.parts[0].text;

        res.json({ description: generatedText });

    } catch (error) {
        console.error("--- AI ROUTE ERROR ---");
        if (error.response) {
            console.error(error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;