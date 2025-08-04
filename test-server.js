// Minimal test server
import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API working!' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${port}`);
});

console.log('Starting test server...');