const http = require('http');
const fs = require('fs');
const path = require('path');
const { queryAnswer } = require('./openai');

const host = 'localhost';
const port = 6060;
const sessionMaps = {};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = {};
    let requestBody = '';
    req.on('data', chunk => {
      requestBody += chunk;
    });
    req.on('end', () => {
      body = JSON.parse(requestBody || '{}');
      resolve(body);
    });
  });
}

const server = http.createServer(async (req, res) => {
  console.log('req', req.method, req.url);

  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'renderer', 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/renderer/')) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        const extname = path.extname(filePath);
        let contentType = 'application/octet-stream';
        if (extname === '.js') {
          contentType = 'text/javascript';
        } else if (extname === '.css') {
          contentType = 'text/css';
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  } else if (req.method === 'GET' && req.url === '/api/session') {
    const responseBody = JSON.stringify({ c: '0000', d: Object.keys(sessionMaps).map(v => ({ sessionId: v, ...sessionMaps[v] })) });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(responseBody);
  } else if (req.method === 'POST' && req.url.startsWith('/api')) {
    const body = await parseBody(req);
    console.log('body', body);
    if (req.url === '/api/session') {
      let sessionIds = Object.keys(sessionMaps);
      if (sessionIds.length === 0) {
        sessionIds = [0];
      }
      const maxSessionId = Math.max(...sessionIds.map(v => Number(v)));
      sessionMaps[maxSessionId + 1] = [];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        c: '0000',
        d: {
          sessionId: maxSessionId + 1,
        },
      }));
    } else if (req.url === '/api/chat') {
      const chat = sessionMaps[body.sessionId].messages || [];
      sessionMaps[body.sessionId].sessionName = body.sessionName || body.message.slice(0, 10);
      console.log('拿到的chat', chat);
      chat.push({ role: 'user', content: body.message });

      const answer = await queryAnswer(chat, body.model);
      console.log('拿到的answer', answer);
      chat.push({
        ...answer,
      });

      sessionMaps[body.sessionId].messages = chat;
      const responseBody = JSON.stringify({
        c: '0000',
        d: {
          sessionId: body.sessionId,
          ...answer,
        },
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseBody);
    } else {
      const responseBody = JSON.stringify({ c: '0000', d: {} });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(responseBody);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
