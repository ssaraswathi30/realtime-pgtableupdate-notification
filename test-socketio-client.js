#!/usr/bin/env node
const io = require('socket.io-client');

console.log('🔗 Connecting to Socket.IO server...');
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');
  console.log('📡 Socket ID:', socket.id);
  
  // Subscribe to logs
  socket.emit('subscribe-logs', { client: 'test-node-client' });
});

socket.on('welcome', (data) => {
  console.log('👋 Welcome message:', data.message);
});

socket.on('log-update', (data) => {
  console.log('📨 New log received:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

// Keep the script running
console.log('🎧 Listening for real-time log updates...');
console.log('Press Ctrl+C to exit');
