import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../data/hireloop.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL,
    location TEXT,
    skills TEXT,
    experience TEXT,
    education TEXT,
    years_of_experience INTEGER,
    stage TEXT NOT NULL,
    fit_score INTEGER,
    fit_score_breakdown TEXT,
    resume_text TEXT,
    source TEXT DEFAULT 'Direct Application',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );



  CREATE TABLE IF NOT EXISTS scorecards (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    interviewer_id TEXT,
    stage TEXT NOT NULL,
    scores TEXT, -- JSON { "competency": rating }
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS job_candidates (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    candidate_id TEXT NOT NULL,
    match_score INTEGER,
    strengths TEXT,
    gaps TEXT,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE(job_id, candidate_id)
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    job_id TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    video_link TEXT,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS outreach_emails (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL,
    job_id TEXT,
    sequence_day INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    sent_at DATETIME,
    opened_at DATETIME,
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    interview_id TEXT NOT NULL,
    question TEXT NOT NULL,
    criterion TEXT NOT NULL,
    listen_for TEXT,
    rating INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS contact_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    company_name TEXT,
    website TEXT,
    auto_reject_threshold TEXT,
    email_notifications BOOLEAN,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'connected' | 'disconnected'
    config TEXT, -- JSON config if needed
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migrations for candidates table
try {
  db.prepare("ALTER TABLE candidates ADD COLUMN source TEXT DEFAULT 'Direct Application'").run();
} catch (error) {
  // Column likely already exists
}

try {
  db.prepare("ALTER TABLE candidates ADD COLUMN job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL").run();
} catch (error) {
  // Column likely already exists
}

// Migrations
try {
  // Check if deal_breakers column exists in jobs table
  const jobsColumns = db.prepare("PRAGMA table_info(jobs)").all() as any[];
  const hasDealBreakers = jobsColumns.some((col: any) => col.name === 'deal_breakers');

  if (!hasDealBreakers) {
    console.log('Adding deal_breakers column to jobs table...');
    db.exec(`ALTER TABLE jobs ADD COLUMN deal_breakers TEXT DEFAULT '{"location_match":false,"no_sponsorship":false,"onsite_required":false}'`);
    console.log('deal_breakers column added successfully');
  }

  // Check if auto_sourcing_enabled column exists
  const hasAutoSourcing = jobsColumns.some((col: any) => col.name === 'auto_sourcing_enabled');
  if (!hasAutoSourcing) {
    console.log('Adding auto_sourcing columns to jobs table...');
    db.exec(`ALTER TABLE jobs ADD COLUMN auto_sourcing_enabled BOOLEAN DEFAULT 0`);
    db.exec(`ALTER TABLE jobs ADD COLUMN sourcing_threshold INTEGER DEFAULT 70`);
    console.log('auto_sourcing columns added successfully');
  }
} catch (error) {
  console.error('Migration error:', error);
}

console.log('Database initialized successfully');

export default db;
