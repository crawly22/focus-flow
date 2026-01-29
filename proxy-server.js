// Simple CORS proxy server for Claude API
// Note: fetch is built-in to Node.js v18+
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/claude', async (req, res) => {
    try {
        const { messages, max_tokens } = req.body;
        const apiKey = process.env.CLAUDE_API_KEY || req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({ error: 'API key missing' });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: max_tokens || 1024,
                messages,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Claude API Error:', data);
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ CORS Proxy running on http://localhost:${PORT}`);
    console.log(`📝 Forward requests to: http://localhost:${PORT}/api/claude`);
});
