const { Client } = require('pg');
const http = require('http');
const { Server } = require('socket.io');
const url = require('url');

const db = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://loguser:logpass@localhost:5432/logsdb',
});

db.connect();
db.query('LISTEN log_channel');
db.query('LISTEN botstatus_channel');

// Create HTTP server for API endpoints
const httpServer = http.createServer(async (req, res) => {
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
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/botstatus') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { bot_name, status, health_score, description } = JSON.parse(body);
        
        // Insert or update botstatus in database
        const result = await db.query(
          'INSERT INTO botstatus (bot_name, status, health_score, description) VALUES ($1, $2, $3, $4) RETURNING *',
          [bot_name, status, health_score || 100, description]
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, botstatus: result.rows[0] }));
      } catch (error) {
        console.error('Error inserting botstatus:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/botstatus') {
    try {
      const result = await db.query('SELECT * FROM botstatus ORDER BY created_at DESC');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, botstatuses: result.rows }));
    } catch (error) {
      console.error('Error fetching botstatus:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/logs') {
    try {
      const limit = parsedUrl.query.limit || 50; // Default to 50 logs
      const result = await db.query('SELECT * FROM logs ORDER BY created_at DESC LIMIT $1', [limit]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, logs: result.rows }));
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', clients: io.engine.clientsCount || 0 }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

httpServer.listen(8080, () => {
  console.log('✅ HTTP API + Socket.IO server running on http://localhost:8080');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`📡 Socket.IO client connected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);
  
  // Send welcome message
  socket.emit('welcome', { message: 'Connected to real-time log updates' });
  
  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ Socket.IO client disconnected: ${socket.id}, reason: ${reason}. Total clients: ${io.engine.clientsCount}`);
  });
  
  // Handle custom events (optional)
  socket.on('subscribe-logs', (data) => {
    console.log(`📝 Client ${socket.id} subscribed to logs:`, data);
    socket.join('logs'); // Join a specific room for targeted broadcasting
  });
});

db.on('notification', msg => {
  const payload = JSON.parse(msg.payload);
  
  if (msg.channel === 'log_channel') {
    console.log('📨 New log entry inserted:', payload);
    console.log(`🔄 Broadcasting log to ${io.engine.clientsCount} connected clients`);
    // Broadcast to all Socket.IO clients
    io.emit('log-update', payload);
  } else if (msg.channel === 'botstatus_channel') {
    console.log('🤖 Bot status updated:', payload);
    console.log(`🔄 Broadcasting bot status to ${io.engine.clientsCount} connected clients`);
    // Broadcast to all Socket.IO clients
    io.emit('botstatus-update', payload);
  }
  
  // Alternative: Broadcast only to clients in specific rooms
  // io.to('logs').emit('log-update', payload);
  // io.to('botstatus').emit('botstatus-update', payload);
});

