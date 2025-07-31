const { Client } = require('pg');
const WebSocket = require('ws');

const db = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://loguser:logpass@localhost:5432/logsdb',
});

db.connect();
db.query('LISTEN log_channel');

const wss = new WebSocket.Server({ port: 8080 });
console.log('✅ WebSocket server running on ws://localhost:8080');

wss.on('connection', ws => {
  console.log('📡 WebSocket client connected');
});

db.on('notification', msg => {
  const payload = JSON.parse(msg.payload);
  console.log('📨 New log entry inserted:', payload);

  // Broadcast to all WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
});
