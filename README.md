# 🤖 PostgreSQL Real-Time Log & Bot Status Notification (pg_notify + Node.js + WebSocket)

This project shows how to trigger real-time updates when log entries are inserted into a PostgreSQL table and when bot statuses are updated using:

- `pg_notify` in PostgreSQL
- `pg` + `ws` in Node.js
- WebSocket frontend for live UI updates

---

## 🚀 How It Works

1. When a new row is inserted into `logs` or `botstatus` tables, a `pg_notify` is triggered.
2. Node.js backend listens to `log_channel` and `botstatus_channel`.
3. Broadcasts payload to all connected frontend clients via WebSocket.

---

## � Quick Start

```bash
# Clone the repository
git clone https://github.com/ssaraswathi30/realtime-pgtableupdate-notification.git
cd realtime-pgtableupdate-notification

# Quick setup with Docker (recommended)
npm run docker-up
# OR use the startup script
npm run setup

# Access the dashboard
open http://localhost:3000/dashboard.html
```

## 📜 Available NPM Scripts

```bash
npm run docker-up      # Start all services with Docker
npm run docker-build   # Rebuild and start containers  
npm run docker-down    # Stop all containers
npm run setup          # Run start-dashboard.sh script
npm run install-deps   # Install backend dependencies
npm start              # Start backend server (requires PostgreSQL)
npm run test-api       # Run all API tests
npm run test-bots      # Test bot status API only
npm run test-logs      # Test logs API only
```

---

## �🛠️ Setup

### Option 1: Docker (Recommended)

1. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000/client1.html
   - Dashboard (Logs + Bot Status): http://localhost:3000/dashboard.html
   - WebSocket: ws://localhost:8080
   - PostgreSQL: localhost:5432

3. **Test by inserting log data:**
   ```bash
   docker exec -it postgres-logs psql -U loguser -d logsdb -c "INSERT INTO logs (log_level, message, source) VALUES ('INFO', 'Application started', 'server');"
   ```

4. **Test by updating bot status:**
   ```bash
   docker exec -it postgres-logs psql -U loguser -d logsdb -c "INSERT INTO botstatus (bot_name, status, health_score, description) VALUES ('TestBot-Delta', 'ONLINE', 92, 'Test bot running perfectly');"
   ```

### Option 2: Manual Setup

#### Quick Start with NPM Scripts

From the root directory, you can use these convenient scripts:

```bash
# Install dependencies
npm run install-deps

# Start the backend server
npm start

# Run all tests
npm run test-api

# Docker commands
npm run docker-up     # Start containers
npm run docker-build  # Rebuild and start
npm run docker-down   # Stop containers

# Quick setup (runs start-dashboard.sh)
npm run setup
```

#### Manual Setup

##### PostgreSQL

1. Install PostgreSQL and create a database
2. Run `sql/init.sql` in your PostgreSQL database

##### Backend

```bash
cd listener
npm install
npm start
```

#### Frontend

Serve the `frontend/index.html` file using any web server.

---

## 🧪 Testing

Once everything is running, you can test the real-time notifications by inserting log entries and updating bot statuses:

### Using Docker:

**Insert Log Entries:**
```bash
docker exec -it postgres-logs psql -U loguser -d logsdb -c "
INSERT INTO logs (log_level, message, source) VALUES 
('ERROR', 'Database connection failed', 'api-server'),
('INFO', 'User logged in successfully', 'auth-service'),
('DEBUG', 'Processing request ID: 12345', 'request-handler');
"
```

**Update Bot Statuses:**
```bash
docker exec -it postgres-logs psql -U loguser -d logsdb -c "
INSERT INTO botstatus (bot_name, status, health_score, description) VALUES 
('NewBot-Echo', 'ONLINE', 95, 'Echo bot responding to messages'),
('MaintenanceBot', 'MAINTENANCE', 25, 'System maintenance in progress');
"
```

**Update Existing Bot Status:**
```bash
docker exec -it postgres-logs psql -U loguser -d logsdb -c "
UPDATE botstatus SET status = 'OFFLINE', health_score = 0, description = 'Bot stopped for updates' WHERE bot_name = 'ChatBot-Alpha';
"
```

### Using local PostgreSQL:

**Log Entries:**
```sql
INSERT INTO logs (log_level, message, source) VALUES 
('WARNING', 'High memory usage detected', 'monitoring'),
('INFO', 'Backup completed successfully', 'backup-service');
```

**Bot Status Updates:**
```sql
INSERT INTO botstatus (bot_name, status, health_score, description) VALUES 
('LocalBot-Test', 'ONLINE', 88, 'Local test bot active');

UPDATE botstatus SET health_score = 75, description = 'Performance slightly degraded' WHERE bot_name = 'DataBot-Beta';
```

## 📁 Project Structure

```
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Docker image for Node.js listener
├── package.json               # Root package.json with npm scripts
├── .env.example               # Environment variables template
├── frontend/
│   ├── index.html             # Basic WebSocket client frontend
│   ├── client1.html           # Enhanced client with styling
│   └── dashboard.html         # Split-view dashboard (Logs + Bot Status)
├── listener/
│   ├── listener.js            # Node.js WebSocket server with API endpoints
│   └── package.json           # Node.js dependencies
├── sql/
│   └── init.sql              # PostgreSQL schema, triggers, and sample data
├── start-dashboard.sh         # Quick startup script
├── test-botstatus-api.js      # Bot status API test script
├── test-logs-api.js           # Logs API test script
└── README.md
```

## 🔧 Configuration

- **Database**: PostgreSQL with `pg_notify` triggers for both logs and bot status
- **Backend**: Node.js with `pg` and `ws` packages
- **Frontend**: Plain HTML with WebSocket client for real-time updates
- **Docker**: Multi-container setup with Docker Compose

## 📡 API Endpoints

- `GET /api/health` - Server health check
- `GET /api/logs?limit=N` - Get recent logs (default limit: 50)
- `GET /api/botstatus` - Get all bot statuses
- `POST /api/logs` - Insert new log entry
- `POST /api/botstatus` - Insert new bot status

## 🎯 Features

- ✅ Real-time log monitoring
- ✅ Real-time bot status tracking
- ✅ **Historical data loading on page refresh**
- ✅ Split-view dashboard
- ✅ Health score visualization
- ✅ Auto-refresh on database changes
- ✅ WebSocket connectivity status
- ✅ Responsive design
- ✅ Docker containerization
- ✅ Duplicate prevention for real-time updates
