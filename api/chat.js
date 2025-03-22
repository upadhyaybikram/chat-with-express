const axios = require("axios");

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, file } = req.body;
        const api_key = process.env.API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`;

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

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching API response", error.response ? error.response.data: error.message);
        res.status(500).json({
            error: error.response ? error.response.data: error.message || "Internal Server Error"
        });
    }
} 