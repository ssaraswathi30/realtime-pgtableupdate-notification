-- Create logs table
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to notify on insert
CREATE OR REPLACE FUNCTION notify_log_insert()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('log_channel', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that calls the function after insert
CREATE TRIGGER logs_insert_notify
AFTER INSERT ON logs
FOR EACH ROW EXECUTE FUNCTION notify_log_insert();

-- Create botstatus table
CREATE TABLE botstatus (
  id SERIAL PRIMARY KEY,
  bot_name TEXT NOT NULL,
  status TEXT NOT NULL,
  health_score INTEGER DEFAULT 100,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to notify on botstatus insert/update
CREATE OR REPLACE FUNCTION notify_botstatus_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('botstatus_channel', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that calls the function after insert or update
CREATE TRIGGER botstatus_change_notify
AFTER INSERT OR UPDATE ON botstatus
FOR EACH ROW EXECUTE FUNCTION notify_botstatus_change();

-- Insert sample bot status data
INSERT INTO botstatus (bot_name, status, health_score, description) VALUES 
('ChatBot-Alpha', 'ONLINE', 95, 'Customer service bot running normally'),
('DataBot-Beta', 'MAINTENANCE', 0, 'Scheduled maintenance in progress'),
('MonitorBot-Gamma', 'ONLINE', 88, 'System monitoring active');
