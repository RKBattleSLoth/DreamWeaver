const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'Test server running' }));
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});