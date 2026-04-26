const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * FEATURE 1: Generate description from an English Title
 */
router.post("/generate_full_post", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const data = JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": `Write a professional 100-word blog description for the following title: "${title}"`
                }]
            }]
        });

        const config = {
            method: 'post',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            data: data
        };

        const response = await axios.request(config);
        const generatedText = response.data.candidates[0].content.parts[0].text;

        res.json({ description: generatedText });

    } catch (error) {
        console.error("--- AI ROUTE ERROR (Generate) ---");
        if (error.response) {
            console.error(error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * FEATURE 2: Voice-to-Blog (Bangla Voice -> English Blog)
 * This handles the messy Bangla transcript and converts it to a clean English post.
 */
router.post("/voice_to_blog", async (req, res) => {
    try {
        const { rawTranscript } = req.body; // Incoming Bangla text from Frontend

        if (!rawTranscript) {
            return res.status(400).json({ error: "No voice transcript detected" });
        }

        const data = JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": `You are a professional blog editor. I will provide a messy voice transcript in Bangla. 
                    Please do the following:
                    1. Translate the content into English.
                    2. Remove filler words (like umm, ahh) and fix grammatical errors.
                    3. Expand it into a structured, engaging blog post description of about 100-150 words.
                    
                    Bangla Transcript: "${rawTranscript}"`
                }]
            }]
        });

        const config = {
            method: 'post',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            data: data
        };

        const response = await axios.request(config);
        const translatedBlog = response.data.candidates[0].content.parts[0].text;

        res.json({ description: translatedBlog });

    } catch (error) {
        console.error("--- AI ROUTE ERROR (Voice) ---");
        if (error.response) {
            console.error(error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: "Failed to process voice translation" });
    }
});

router.post('/refine_content', async (req, res) => {
    try {
        const { text, action } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Content text is required" });
        }

        const prompts = {
            expand: "Expand this blog description with more professional details and insights while keeping the original context: ",
            shorten: "Summarize this blog description to be concise and punchy: ",
            professional: "Rewrite this blog description to sound highly professional, authoritative, and corporate: ",
            creative: "Rewrite this blog description to be more engaging, creative, and storytelling-oriented: "
        };

        const instruction = prompts[action] || "Improve this text: ";

        const data = JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": `${instruction}\n\nContent: "${text}"`
                }]
            }]
        });

        const config = {
            method: 'post',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY
            },
            data: data
        };

        const response = await axios.request(config);

        // Safety check for API response structure
        if (response.data.candidates && response.data.candidates[0].content.parts[0].text) {
            const refinedText = response.data.candidates[0].content.parts[0].text;
            res.json({ refinedText: refinedText });
        } else {
            throw new Error("Invalid response from Gemini API");
        }

    } catch (error) {
        console.error("--- AI ROUTE ERROR (Refine) ---");
        if (error.response) {
            console.error(error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: error.message || "Refinement failed" });
    }
});

module.exports = router;