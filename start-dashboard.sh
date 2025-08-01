#!/bin/bash

echo "🚀 Starting PostgreSQL Real-Time Dashboard..."
echo "📊 This will start logs and bot status monitoring"
echo ""

# Start Docker Compose
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until docker exec postgres-logs pg_isready -U loguser -d logsdb > /dev/null 2>&1; do
  echo "   ⏳ Waiting for PostgreSQL..."
  sleep 2
done
echo "   ✅ PostgreSQL is ready!"

# Check if Node.js server is ready
echo "🔍 Checking Node.js server..."
until curl -s http://localhost:8080/api/health > /dev/null 2>&1; do
  echo "   ⏳ Waiting for Node.js server..."
  sleep 2
done
echo "   ✅ Node.js server is ready!"

echo ""
echo "🎉 All services are running!"
echo ""
echo "📋 Available endpoints:"
echo "   📊 Dashboard:     http://localhost:3000/dashboard.html"
echo "   📝 Basic Logs:    http://localhost:3000/index.html"
echo "   🎨 Styled Client: http://localhost:3000/client1.html"
echo "   🔧 API Health:    http://localhost:8080/api/health"
echo "   📊 Bot Status:    http://localhost:8080/api/botstatus"
echo "   📝 Logs API:      http://localhost:8080/api/logs"
echo ""
echo "🧪 Test commands:"
echo ""
echo "Insert log entry:"
echo ' docker exec -it postgres-logs psql -U loguser -d logsdb -c "INSERT INTO logs (log_level, message, source) VALUES ('INFO', 'System monitoring check completed successfully', 'health-monitor');" '
echo ""
echo "Add bot status:"
echo '   docker exec -it postgres-logs psql -U loguser -d logsdb -c "INSERT INTO botstatus (bot_name, status, health_score, description) VALUES ('SecurityBot-Omega', 'ONLINE', 98, 'Security monitoring bot performing optimally');" '
echo ""
echo "Update bot status:"
echo '  docker exec -it postgres-logs psql -U loguser -d logsdb -c "INSERT INTO logs (log_level, message, source) VALUES ('INFO', 'System monitoring check completed successfully', 'health-monitor');"'
echo ""
echo "🚀 Ready to go! Open the dashboard and try the test commands above."
