-- Atomic Engine Industry-Agnostic Schema
-- Swarm Brain Database Schema with node support
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Nodes table - Sub-Atom registry
CREATE TABLE IF NOT EXISTS nodes (
  node_id TEXT PRIMARY KEY,
  node_status TEXT NOT NULL CHECK (node_status IN ('ACTIVE', 'IDLE', 'ERROR', 'OFFLINE')),
  performance_metric NUMERIC NOT NULL DEFAULT 1.0,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Units table (industry-agnostic, replaces items)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id TEXT NOT NULL REFERENCES nodes(node_id),
  unit_code TEXT NOT NULL,
  description TEXT,
  category TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(node_id, unit_code)
);

-- Transactions table (industry-agnostic, replaces orders)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id TEXT NOT NULL REFERENCES nodes(node_id),
  transaction_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(node_id, transaction_number)
);

-- Sessions table (updated with industry-agnostic columns)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id TEXT NOT NULL REFERENCES nodes(node_id),
  tracking_identifier TEXT NOT NULL, -- Replaces lpn
  state TEXT NOT NULL CHECK (state IN ('IDLE', 'VALIDATION', 'VERIFICATION', 'PROCESSING', 'COMPLETE')),
  transaction_id UUID REFERENCES transactions(id), -- Replaces order_id
  category TEXT, -- Replaces prefix
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Session Units junction table (replaces session_items)
CREATE TABLE IF NOT EXISTS session_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, unit_id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id TEXT NOT NULL REFERENCES nodes(node_id),
  session_id UUID REFERENCES sessions(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_tracking_identifier ON sessions(tracking_identifier);
CREATE INDEX IF NOT EXISTS idx_sessions_node_id ON sessions(node_id);
CREATE INDEX IF NOT EXISTS idx_sessions_state ON sessions(state);
CREATE INDEX IF NOT EXISTS idx_units_node_id ON units(node_id);
CREATE INDEX IF NOT EXISTS idx_units_unit_code ON units(unit_code);
CREATE INDEX IF NOT EXISTS idx_transactions_node_id ON transactions(node_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_number ON transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_session_units_session_id ON session_units(session_id);
CREATE INDEX IF NOT EXISTS idx_session_units_unit_id ON session_units(unit_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_node_id ON audit_logs(node_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for nodes - allow all operations for now (adjust based on auth requirements)
CREATE POLICY "Allow all operations on nodes" ON nodes
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for units - allow all operations
CREATE POLICY "Allow all operations on units" ON units
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for transactions - allow all operations
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for sessions - allow all operations
CREATE POLICY "Allow all operations on sessions" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for session_units - allow all operations
CREATE POLICY "Allow all operations on session_units" ON session_units
  FOR ALL USING (true) WITH CHECK (true);

-- Policies for audit_logs - allow all operations
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Triggers to auto-update updated_at
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
