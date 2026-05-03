const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

require("dotenv").config();

const Database = require("better-sqlite3");
const compression = require("compression");
const express = require("express");
const helmet = require("helmet");

const app = express();
const PORT = Number(process.env.PORT || 4173);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "hanen.sqlite");
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 12);

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use("/assets", express.static(path.join(__dirname, "assets"), { dotfiles: "deny", maxAge: "1h" }));
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get(["/styles.css", "/app.js", "/vendor-qrcode.min.js"], (req, res) => {
  res.sendFile(path.join(__dirname, req.path.slice(1)));
});

initDatabase();

app.get("/api/health", (req, res) => {
  res.json({ ok: true, database: DB_PATH, time: new Date().toISOString() });
});

app.post("/api/staff/login", (req, res) => {
  const { username, password, role } = req.body || {};
  const user = db
    .prepare("SELECT * FROM staff_users WHERE username = ? AND role = ? AND is_active = 1")
    .get(String(username || "").trim(), String(role || "").trim());

  if (!user || !verifyPassword(String(password || ""), user.password_hash)) {
    return res.status(401).json({ error: "Invalid staff credentials." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare(
    "INSERT INTO staff_sessions (token, staff_user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
  ).run(token, user.id, expiresAt, new Date().toISOString());
  audit("staff_login", { username: user.username, role: user.role }, user.id);

  res.json({
    token,
    staff: {
      username: user.username,
      role: user.role,
      fullName: user.full_name
    }
  });
});

app.post("/api/staff/logout", (req, res) => {
  const token = getBearerToken(req);
  if (token) {
    db.prepare("DELETE FROM staff_sessions WHERE token = ?").run(token);
  }
  res.json({ ok: true });
});

app.get("/api/records", requireStaff, (req, res) => {
  const records = db
    .prepare("SELECT record_json FROM treatment_records ORDER BY datetime(updated_at) DESC")
    .all()
    .map((row) => JSON.parse(row.record_json));
  res.json({ records });
});

app.put("/api/records/bulk", requireStaff, (req, res) => {
  const records = Array.isArray(req.body?.records) ? req.body.records : [];
  const result = upsertRecords(records);
  audit("records_bulk_upsert", { count: result.count }, req.staff.id);
  res.json({ ok: true, ...result });
});

app.post("/api/patient/verify", (req, res) => {
  const name = normalizeText(req.body?.name);
  const idNo = normalizeText(req.body?.idNo).toUpperCase();
  const birthday = normalizeText(req.body?.birthday);
  const token = normalizeText(req.body?.token);

  const rows = token
    ? db.prepare("SELECT record_json FROM treatment_records WHERE token = ?").all(token)
    : db.prepare("SELECT record_json FROM treatment_records WHERE national_id_no = ? AND birthday = ?").all(idNo, birthday);

  const matched = rows
    .map((row) => JSON.parse(row.record_json))
    .find((record) => normalizeText(record.name) === name && normalizeText(record.idNo).toUpperCase() === idNo && normalizeText(record.birthday) === birthday);

  if (!matched) {
    return res.status(404).json({ error: "Patient record not found." });
  }

  audit("patient_verify", { token: matched.token });
  res.json({ record: matched });
});

app.put("/api/patient/records/:token", (req, res) => {
  const token = String(req.params.token || "");
  const record = req.body?.record;
  const identity = req.body?.identity || {};
  if (!record || record.token !== token) {
    return res.status(400).json({ error: "Invalid record payload." });
  }

  const existingRow = db.prepare("SELECT record_json FROM treatment_records WHERE token = ?").get(token);
  if (!existingRow) {
    return res.status(404).json({ error: "Treatment record not found." });
  }

  const existing = JSON.parse(existingRow.record_json);
  const identityMatches =
    normalizeText(identity.name) === normalizeText(existing.name) &&
    normalizeText(identity.idNo).toUpperCase() === normalizeText(existing.idNo).toUpperCase() &&
    normalizeText(identity.birthday) === normalizeText(existing.birthday);

  if (!identityMatches) {
    return res.status(403).json({ error: "Patient identity verification expired." });
  }

  upsertRecords([record]);
  audit("patient_record_update", { token });
  res.json({ ok: true, record });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Han En clinic portal listening on http://0.0.0.0:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});

function initDatabase() {
  db.exec(`
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
      treatment_type TEXT NOT NULL,
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
  `);

  seedStaffUser("doctor.hsu", "demo1234", "doctor", "Doctor Hsu");
  seedStaffUser("nurse.chen", "demo1234", "nurse", "Nurse Chen");
  db.prepare("DELETE FROM staff_sessions WHERE datetime(expires_at) < datetime('now')").run();
}

function seedStaffUser(username, password, role, fullName) {
  const exists = db.prepare("SELECT 1 FROM staff_users WHERE username = ?").get(username);
  if (exists) return;
  db.prepare(
    "INSERT INTO staff_users (id, username, role, full_name, password_hash, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)"
  ).run(crypto.randomUUID(), username, role, fullName, hashPassword(password), new Date().toISOString());
}

function upsertRecords(records) {
  const stmt = db.prepare(`
    INSERT INTO treatment_records (
      token, chart_no, patient_name, national_id_no, birthday, treatment_type, status, created_at, updated_at, record_json
    ) VALUES (
      @token, @chartNo, @name, @idNo, @birthday, @treatmentType, @status, @createdAt, @updatedAt, @recordJson
    )
    ON CONFLICT(token) DO UPDATE SET
      chart_no = excluded.chart_no,
      patient_name = excluded.patient_name,
      national_id_no = excluded.national_id_no,
      birthday = excluded.birthday,
      treatment_type = excluded.treatment_type,
      status = excluded.status,
      updated_at = excluded.updated_at,
      record_json = excluded.record_json
  `);

  const tx = db.transaction((items) => {
    for (const record of items) {
      if (!record?.token) continue;
      const now = new Date().toISOString();
      stmt.run({
        token: String(record.token),
        chartNo: String(record.chartNo || ""),
        name: String(record.name || ""),
        idNo: String(record.idNo || "").toUpperCase(),
        birthday: String(record.birthday || ""),
        treatmentType: String(record.treatmentType || "magnetic-chair"),
        status: String(record.status || "queued"),
        createdAt: String(record.createdAt || now),
        updatedAt: String(record.updatedAt || now),
        recordJson: JSON.stringify(record)
      });
    }
  });

  tx(records);
  return { count: records.length };
}

function requireStaff(req, res, next) {
  const token = getBearerToken(req);
  const session = token
    ? db
        .prepare(
          `SELECT s.token, s.expires_at, u.id, u.username, u.role, u.full_name
           FROM staff_sessions s
           JOIN staff_users u ON u.id = s.staff_user_id
           WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')`
        )
        .get(token)
    : null;

  if (!session) {
    return res.status(401).json({ error: "Staff login required." });
  }

  req.staff = session;
  next();
}

function getBearerToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored || "").split("$");
  if (scheme !== "pbkdf2" || !salt || !expected) return false;
  const actual = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function audit(action, payload = {}, staffUserId = null) {
  db.prepare("INSERT INTO audit_logs (id, staff_user_id, action, payload_json, created_at) VALUES (?, ?, ?, ?, ?)").run(
    crypto.randomUUID(),
    staffUserId,
    action,
    JSON.stringify(payload),
    new Date().toISOString()
  );
}

function normalizeText(value) {
  return String(value || "").trim();
}
