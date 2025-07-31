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
