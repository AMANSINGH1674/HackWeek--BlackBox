const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

app.use(bodyParser.json());

// Friendly root route
app.get('/', (req, res) => {
  res.send(`
    <h2>Mock Blackbox API</h2>
    <p>Available endpoints:</p>
    <ul>
      <li>POST /data — Base64 encode input string (JSON: { data })</li>
      <li>POST /fizzbuzz — Returns false for all tested inputs (JSON: { data })</li>
      <li>POST /zap — Returns only alphabetic chars, or input for special chars, or empty for numbers (JSON: { data })</li>
      <li>POST /alpha — True if any ASCII letter in input (JSON: { data })</li>
      <li>POST /glitch — Reverses the input string (JSON: { data })</li>
      <li>GET /time — Returns seconds since server start</li>
    </ul>
    <p>Use Postman, curl, or your test script to interact with these endpoints.</p>
  `);
});

// /data: Base64 encode
app.post('/data', (req, res) => {
  const { data } = req.body;
  if (typeof data !== 'string' || data.length === 0) {
    return res.json({ error: 'Invalid input' });
  }
  const encoded = Buffer.from(data, 'utf8').toString('base64');
  res.json({ result: encoded });
});

// /fizzbuzz: always false (per observed behavior)
app.post('/fizzbuzz', (req, res) => {
  res.json({ result: false });
});

// /zap: return only alphabetic chars, or input for special chars, or empty for numbers
app.post('/zap', (req, res) => {
  const { data } = req.body;
  if (typeof data !== 'string') return res.json({ result: '' });
  if (/^[a-zA-Z]+$/.test(data)) return res.json({ result: data });
  if (/^[0-9]+$/.test(data)) return res.json({ result: '' });
  if (/^[a-zA-Z0-9]+$/.test(data)) return res.json({ result: data.replace(/[^a-zA-Z]/g, '') });
  if (/^[^a-zA-Z0-9]+$/.test(data)) return res.json({ result: data });
  // For mixed or JSON-like, try to keep only alphabetic and some punctuation
  return res.json({ result: (data.match(/[a-zA-Z{}":]/g) || []).join('') });
});

// /alpha: true if any ASCII letter
app.post('/alpha', (req, res) => {
  const { data } = req.body;
  if (typeof data !== 'string') return res.json({ result: false });
  res.json({ result: /[a-zA-Z]/.test(data) });
});

// /glitch: reverse string
app.post('/glitch', (req, res) => {
  const { data } = req.body;
  if (typeof data !== 'string') return res.json({ result: '' });
  res.json({ result: data.split('').reverse().join('') });
});

// /time: return a number as timestamp (seconds since server start)
const serverStart = Math.floor(Date.now() / 1000);
app.get('/time', (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  res.json({ result: now - serverStart });
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
}); 