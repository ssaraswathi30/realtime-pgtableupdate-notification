const { Client } = require('pg');
const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const db = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://loguser:logpass@localhost:5432/logsdb',
});

db.connect();
db.query('LISTEN log_channel');

// Create HTTP server for API endpoints only
const httpServer = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/api/logs') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { log_level, message, source } = JSON.parse(body);
        
        // Insert into database
        const result = await db.query(
          'INSERT INTO logs (log_level, message, source) VALUES ($1, $2, $3) RETURNING *',
          [log_level, message, source]
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, log: result.rows[0] }));
      } catch (error) {
        console.error('Error inserting log:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', clients: wss?.clients?.size || 0 }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Create separate WebSocket server
const wss = new WebSocket.Server({ port: 8081 });

httpServer.listen(8080, () => {
  console.log('✅ HTTP API server running on http://localhost:8080');
});

console.log('✅ WebSocket server running on ws://localhost:8081');

wss.on('connection', ws => {
  console.log(`📡 WebSocket client connected. Total clients: ${wss.clients.size}`);
  
  ws.on('close', () => {
    console.log(`❌ WebSocket client disconnected. Total clients: ${wss.clients.size}`);
  });
});

db.on('notification', msg => {
  const payload = JSON.parse(msg.payload);
  console.log('📨 New log entry inserted:', payload);
  console.log(`🔄 Broadcasting to ${wss.clients.size} connected clients`);

  // Broadcast to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
});

db.on('notification', msg => {
  const payload = JSON.parse(msg.payload);
  console.log('📨 New log entry inserted:', payload);
  console.log(`🔄 Broadcasting to ${wss.clients.size} connected clients`);

  // Broadcast to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
});
