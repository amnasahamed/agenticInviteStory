-- InviteStory AI Database Schema

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_version TEXT NOT NULL,
  capability_version TEXT NOT NULL,
  historical_order_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  approved_spec_revision INTEGER,
  current_attempt INTEGER NOT NULL DEFAULT 1,
  input_hash TEXT NOT NULL,
  upload_keys TEXT NOT NULL, -- JSON
  usage TEXT NOT NULL, -- JSON
  error TEXT, -- JSON
  transition_log TEXT NOT NULL -- JSON
);

CREATE INDEX IF NOT EXISTS idx_jobs_state ON jobs(state);
CREATE INDEX IF NOT EXISTS idx_jobs_historical_order ON jobs(historical_order_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Specs table (immutable revisions)
CREATE TABLE IF NOT EXISTS specs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  spec_json TEXT NOT NULL,
  editor TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_specs_job_revision ON specs(job_id, revision);
CREATE INDEX IF NOT EXISTS idx_specs_job_id ON specs(job_id);

-- Attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  spec_revision INTEGER NOT NULL,
  workspace_key TEXT NOT NULL,
  qa_report TEXT, -- JSON
  changed_files TEXT NOT NULL, -- JSON
  diff TEXT,
  logs TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  idempotency_key TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attempts_job_attempt ON attempts(job_id, attempt);
CREATE INDEX IF NOT EXISTS idx_attempts_job_id ON attempts(job_id);
CREATE INDEX IF NOT EXISTS idx_attempts_idempotency ON attempts(idempotency_key);

-- Media assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  source_key TEXT NOT NULL,
  related_message_ids TEXT NOT NULL, -- JSON
  transcript_ref TEXT,
  ocr_ref TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE INDEX IF NOT EXISTS idx_media_assets_job_id ON media_assets(job_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_sha256 ON media_assets(sha256);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  sender TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  media_asset_ids TEXT NOT NULL, -- JSON
  is_voice INTEGER NOT NULL DEFAULT 0,
  voice_duration_sec INTEGER,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_job_id ON chat_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- QA issues table
CREATE TABLE IF NOT EXISTS qa_issues (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  spec_path TEXT,
  dom_selector TEXT,
  screenshot_region TEXT, -- JSON
  expected TEXT,
  actual TEXT,
  suggested_fix TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE INDEX IF NOT EXISTS idx_qa_issues_job_attempt ON qa_issues(job_id, attempt);
CREATE INDEX IF NOT EXISTS idx_qa_issues_severity ON qa_issues(severity);