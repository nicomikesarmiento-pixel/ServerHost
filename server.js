const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup para payagan ang Sketchware app na kumonekta
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Proxy and Stream Endpoint
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Error: Walang nailagay na target URL.');
    }

    try {
        console.log(`[CLOUD SERVER] Kumukuha ng data para sa: ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            redirect: 'follow'
        });

        if (!response.ok) {
            return res.status(response.status).send(`Nabigong kunin ang URL: ${response.statusText}`);
        }

        // Kopyahin ang tamang content headers
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }

        // I-stream ang data mula sa cloud server patungo sa Sketchware app nang tuloy-tuloy
        const reader = response.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();

    } catch (err) {
        console.error('Proxy Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Root status check
app.get('/', (req, res) => {
    res.send('🚀 Ultra Booster Remote Cloud Server ay Aktibo at Handang Bumayo!');
});

app.listen(PORT, () => {
    console.log(`Server ay tumatakbo at nakikinig sa port ${PORT}`);
});
  
