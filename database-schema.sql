CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin', 'reception')),
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  token TEXT PRIMARY KEY,
  staff_user_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS treatment_records (
  token TEXT PRIMARY KEY,
  chart_no TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  national_id_no TEXT NOT NULL,
  birthday TEXT NOT NULL,
  treatment_type TEXT NOT NULL CHECK (treatment_type IN ('magnetic-chair', 'vaginal-laser')),
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  record_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  staff_user_id TEXT,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_patient ON treatment_records(national_id_no, birthday);
CREATE INDEX IF NOT EXISTS idx_records_chart ON treatment_records(chart_no);
CREATE INDEX IF NOT EXISTS idx_records_updated ON treatment_records(updated_at);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
