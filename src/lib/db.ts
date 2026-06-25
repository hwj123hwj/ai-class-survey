import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'survey.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'radio',
    options TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL UNIQUE,
    user_name TEXT,
    user_phone TEXT,
    user_company TEXT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (response_id) REFERENCES responses(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_responses_session ON responses(session_id);
  CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
  CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
`);

export default db;

// Helper functions
export function getQuestions() {
  return db.prepare('SELECT * FROM questions WHERE is_active = 1 ORDER BY sort_order').all();
}

export function getQuestionById(id: number) {
  return db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
}

export function createResponse(sessionId: string, userName?: string, userPhone?: string, userCompany?: string) {
  const stmt = db.prepare(
    'INSERT INTO responses (session_id, user_name, user_phone, user_company) VALUES (?, ?, ?, ?)'
  );
  return stmt.run(sessionId, userName, userPhone, userCompany);
}

export function saveAnswer(responseId: number, questionId: number, answerValue: string) {
  const stmt = db.prepare(
    'INSERT INTO answers (response_id, question_id, answer_value) VALUES (?, ?, ?)'
  );
  return stmt.run(responseId, questionId, answerValue);
}

export function completeResponse(sessionId: string) {
  const stmt = db.prepare(
    'UPDATE responses SET is_completed = 1, completed_at = datetime(\'now\') WHERE session_id = ?'
  );
  return stmt.run(sessionId);
}

export function getResponseBySessionId(sessionId: string) {
  return db.prepare('SELECT * FROM responses WHERE session_id = ?').get(sessionId);
}

export function getAllResponses() {
  return db.prepare(`
    SELECT r.*,
      GROUP_CONCAT(q.question_text || ': ' || a.answer_value, ' | ') as answers_summary
    FROM responses r
    LEFT JOIN answers a ON r.id = a.response_id
    LEFT JOIN questions q ON a.question_id = q.id
    WHERE r.is_completed = 1
    GROUP BY r.id
    ORDER BY r.completed_at DESC
  `).all();
}

export function getResponseDetails(responseId: number) {
  return db.prepare(`
    SELECT q.question_text, q.question_type, a.answer_value
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.response_id = ?
    ORDER BY q.sort_order
  `).all(responseId);
}

export function getStatistics() {
  const totalResponses = db.prepare('SELECT COUNT(*) as count FROM responses WHERE is_completed = 1').get() as any;
  const todayResponses = db.prepare(`
    SELECT COUNT(*) as count FROM responses
    WHERE is_completed = 1 AND date(completed_at) = date('now')
  `).get() as any;

  return {
    total: totalResponses.count,
    today: todayResponses.count
  };
}

export function getQuestionStats(questionId: number) {
  return db.prepare(`
    SELECT answer_value, COUNT(*) as count
    FROM answers
    WHERE question_id = ?
    GROUP BY answer_value
    ORDER BY count DESC
  `).all(questionId);
}
