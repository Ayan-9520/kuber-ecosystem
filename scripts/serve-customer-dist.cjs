const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../apps/mobile-customer/dist');
const port = Number(process.argv[2] || 8081);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, 'index.html'), (err2, html) => {
        res.writeHead(err2 ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(err2 ? 'Not found' : html);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Customer app: http://127.0.0.1:${port}`);
});
