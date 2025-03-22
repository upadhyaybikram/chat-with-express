const express = require('express');
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const api_key = process.env.API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, file } = req.body;

        const chatHistory = [
            {
                role: "user",
                parts: [{ text: message }, ...(file ? [{ inline_data: file}]: [] )],
            }
        ];

        const response = await axios.post(
            url,
            { contents: chatHistory },
            { headers: { "Content-Type": "application/json" }}
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching API response", error.response ? error.response.data: error.message);
        res.status(500).json({
            error: error.response ? error.response.data: error.message || "Internal Server Error"
        });
    }
} 