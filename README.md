# � PostgreSQL Real-Time Log Notification (pg_notify + Node.js + WebSocket)

This project shows how to trigger real-time updates when log entries are inserted into a PostgreSQL table using:

- `pg_notify` in PostgreSQL
- `pg` + `ws` in Node.js
- WebSocket frontend for live UI updates

---

## 🚀 How It Works

1. When a new row is inserted into `logs`, a `pg_notify` is triggered.
2. Node.js backend listens to `log_channel`.
3. Broadcasts payload to all connected frontend clients via WebSocket.

---

## 🛠️ Setup

### Option 1: Docker (Recommended)

1. **Start all services with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000/client1.html
   - WebSocket: ws://localhost:8080
   - PostgreSQL: localhost:5432

3. **Test by inserting log data:**
   ```bash
   docker exec -it postgres-logs psql -U loguser -d logsdb -c "INSERT INTO logs (log_level, message, source) VALUES ('INFO', 'Application started', 'server');"
   ```

### Option 2: Manual Setup

#### PostgreSQL

1. Install PostgreSQL and create a database
2. Run `sql/init.sql` in your PostgreSQL database

#### Backend

```bash
cd listener
npm install
npm start
```

#### Frontend

Serve the `frontend/index.html` file using any web server.

---

## 🧪 Testing

Once everything is running, you can test the real-time notifications by inserting log entries:

### Using Docker:
```bash
docker exec -it postgres-logs psql -U loguser -d logsdb -c "
INSERT INTO logs (log_level, message, source) VALUES 
('ERROR', 'Database connection failed', 'api-server'),
('INFO', 'User logged in successfully', 'auth-service'),
('DEBUG', 'Processing request ID: 12345', 'request-handler');
"
```

### Using local PostgreSQL:
```sql
INSERT INTO logs (log_level, message, source) VALUES 
('WARNING', 'High memory usage detected', 'monitoring'),
('INFO', 'Backup completed successfully', 'backup-service');
```

## 📁 Project Structure

```
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Docker image for Node.js listener
├── .env.example               # Environment variables template
├── frontend/
│   └── index.html             # WebSocket client frontend
├── listener/
│   ├── listener.js            # Node.js WebSocket server
│   └── package.json           # Node.js dependencies
├── sql/
│   └── init.sql              # PostgreSQL schema and triggers
└── README.md
```

## 🔧 Configuration

- **Database**: PostgreSQL with `pg_notify` triggers
- **Backend**: Node.js with `pg` and `ws` packages
- **Frontend**: Plain HTML with WebSocket client
- **Docker**: Multi-container setup with Docker Compose
