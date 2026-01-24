const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.ACME_HTTP_PORT || 80);
const rootDir = process.cwd();
const challengesDir = path.join(rootDir, 'public', '.well-known', 'acme-challenge');

function send(res, status, headers, body) {
  try {
    res.writeHead(status, headers);
    res.end(body);
  } catch {}
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (!url.startsWith('/.well-known/acme-challenge/')) {
    send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'Not Found');
    return;
  }

  const token = url.split('/').pop() || '';
  if (token.includes('..') || token.includes('\\') || token.includes('/')) {
    send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'Bad Request');
    return;
  }

  const filePath = path.join(challengesDir, token);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    send(res, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, content);
  } catch {
    send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  process.stdout.write(`ACME challenge server listening on :${port}\n`);
  process.stdout.write(`Serving ${challengesDir}\n`);
});

server.on('error', (err) => {
  process.stderr.write(`ACME challenge server error: ${err?.message || err}\n`);
  process.exit(1);
});

