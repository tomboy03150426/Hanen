CREATE TABLE staff_users (
  id UUID PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin', 'reception')),
  full_name VARCHAR(80) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id UUID PRIMARY KEY,
  chart_no VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(80) NOT NULL,
  national_id_no VARCHAR(20) NOT NULL UNIQUE,
  birthday DATE NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinic_devices (
  id UUID PRIMARY KEY,
  device_name VARCHAR(80) NOT NULL,
  device_role VARCHAR(20) NOT NULL CHECK (device_role IN ('tablet', 'reception', 'staff')),
  local_ip VARCHAR(64),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinic_visits (
  id UUID PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id),
  visit_code VARCHAR(80) NOT NULL UNIQUE,
  treatment_code VARCHAR(40) NOT NULL CHECK (treatment_code IN ('magnetic-chair', 'vaginal-laser')),
  payment_plan VARCHAR(30) NOT NULL CHECK (payment_plan IN ('paid_full', 'per_visit')),
  purchased_sessions INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'active', 'pending_signature', 'completed', 'cancelled')),
  attending_doctor_id UUID REFERENCES staff_users(id),
  assigned_nurse_id UUID REFERENCES staff_users(id),
  created_by_staff_id UUID REFERENCES staff_users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visit_access_sessions (
  id UUID PRIMARY KEY,
  clinic_visit_id UUID NOT NULL REFERENCES clinic_visits(id) ON DELETE CASCADE,
  access_token VARCHAR(120) NOT NULL UNIQUE,
  access_channel VARCHAR(20) NOT NULL CHECK (access_channel IN ('tablet', 'iphone-test', 'link')),
  launched_by_staff_id UUID REFERENCES staff_users(id),
  bound_device_id UUID REFERENCES clinic_devices(id),
  expires_at TIMESTAMP,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treatment_sessions (
  id UUID PRIMARY KEY,
  clinic_visit_id UUID NOT NULL REFERENCES clinic_visits(id) ON DELETE CASCADE,
  session_no INTEGER NOT NULL,
  session_date DATE,
  intensity_percent INTEGER CHECK (intensity_percent BETWEEN 0 AND 100),
  treatment_area VARCHAR(120),
  duration_minutes INTEGER,
  payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('package', 'paid', 'unpaid')),
  nurse_id UUID REFERENCES staff_users(id),
  patient_feedback TEXT,
  symptom_payload JSONB,
  private_concern_score INTEGER CHECK (private_concern_score BETWEEN 1 AND 10),
  urinary_concern_score INTEGER CHECK (urinary_concern_score BETWEEN 1 AND 10),
  dryness_score INTEGER CHECK (dryness_score BETWEEN 1 AND 10),
  sensitivity_score INTEGER CHECK (sensitivity_score BETWEEN 1 AND 10),
  looseness_score INTEGER CHECK (looseness_score BETWEEN 1 AND 10),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (clinic_visit_id, session_no)
);

CREATE TABLE treatment_session_modes (
  id UUID PRIMARY KEY,
  treatment_session_id UUID NOT NULL REFERENCES treatment_sessions(id) ON DELETE CASCADE,
  mode_code VARCHAR(10) NOT NULL CHECK (mode_code IN ('M1', 'M2', 'M3', 'M4')),
  UNIQUE (treatment_session_id, mode_code)
);

CREATE TABLE patient_signatures (
  id UUID PRIMARY KEY,
  treatment_session_id UUID NOT NULL UNIQUE REFERENCES treatment_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  visit_access_session_id UUID REFERENCES visit_access_sessions(id),
  image_path TEXT NOT NULL,
  signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  signer_ip VARCHAR(64),
  signer_user_agent TEXT
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_staff_id UUID REFERENCES staff_users(id),
  actor_patient_id UUID REFERENCES patients(id),
  clinic_visit_id UUID REFERENCES clinic_visits(id),
  target_table VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  action VARCHAR(40) NOT NULL,
  payload JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clinic_visits_patient ON clinic_visits(patient_id, created_at DESC);
CREATE INDEX idx_visit_access_sessions_token ON visit_access_sessions(access_token);
CREATE INDEX idx_treatment_sessions_visit ON treatment_sessions(clinic_visit_id, session_no);
CREATE INDEX idx_audit_logs_visit ON audit_logs(clinic_visit_id, created_at DESC);
