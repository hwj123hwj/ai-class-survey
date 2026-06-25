import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'survey.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode
db.pragma('journal_mode = WAL');

// Create tables
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

// Insert default admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
db.prepare(`
  INSERT OR IGNORE INTO admins (username, password_hash)
  VALUES (?, ?)
`).run('admin', adminPassword);

// Insert sample questions (15 questions)
const sampleQuestions = [
  {
    question_text: '您所在的部门是？',
    question_type: 'radio',
    options: ['技术部', '产品部', '市场部', '运营部', '人力资源部', '财务部', '其他'],
    sort_order: 1
  },
  {
    question_text: '您在公司的工作年限是？',
    question_type: 'radio',
    options: ['1年以下', '1-3年', '3-5年', '5-10年', '10年以上'],
    sort_order: 2
  },
  {
    question_text: '您对目前工作内容的满意度如何？',
    question_type: 'radio',
    options: ['非常满意', '比较满意', '一般', '不太满意', '非常不满意'],
    sort_order: 3
  },
  {
    question_text: '您认为公司的工作氛围如何？',
    question_type: 'radio',
    options: ['非常好', '比较好', '一般', '不太好', '非常差'],
    sort_order: 4
  },
  {
    question_text: '您对公司提供的培训机会满意吗？',
    question_type: 'radio',
    options: ['非常满意', '比较满意', '一般', '不太满意', '非常不满意'],
    sort_order: 5
  },
  {
    question_text: '您认为公司的晋升机制是否公平？',
    question_type: 'radio',
    options: ['非常公平', '比较公平', '一般', '不太公平', '非常不公平'],
    sort_order: 6
  },
  {
    question_text: '您对公司的薪酬福利满意吗？',
    question_type: 'radio',
    options: ['非常满意', '比较满意', '一般', '不太满意', '非常不满意'],
    sort_order: 7
  },
  {
    question_text: '您认为公司的沟通机制是否顺畅？',
    question_type: 'radio',
    options: ['非常顺畅', '比较顺畅', '一般', '不太顺畅', '非常不顺畅'],
    sort_order: 8
  },
  {
    question_text: '您对公司的办公环境满意吗？',
    question_type: 'radio',
    options: ['非常满意', '比较满意', '一般', '不太满意', '非常不满意'],
    sort_order: 9
  },
  {
    question_text: '您认为公司的团队协作效率如何？',
    question_type: 'radio',
    options: ['非常高', '比较高', '一般', '比较低', '非常低'],
    sort_order: 10
  },
  {
    question_text: '您对公司提供的职业发展机会满意吗？',
    question_type: 'radio',
    options: ['非常满意', '比较满意', '一般', '不太满意', '非常不满意'],
    sort_order: 11
  },
  {
    question_text: '您认为公司的管理方式是否人性化？',
    question_type: 'radio',
    options: ['非常人性化', '比较人性化', '一般', '不太人性化', '非常不人性化'],
    sort_order: 12
  },
  {
    question_text: '您对公司的企业文化认同度如何？',
    question_type: 'radio',
    options: ['非常认同', '比较认同', '一般', '不太认同', '非常不认同'],
    sort_order: 13
  },
  {
    question_text: '您认为公司在员工关怀方面做得如何？',
    question_type: 'radio',
    options: ['非常好', '比较好', '一般', '不太好', '非常差'],
    sort_order: 14
  },
  {
    question_text: '您是否愿意推荐朋友来公司工作？',
    question_type: 'radio',
    options: ['非常愿意', '比较愿意', '一般', '不太愿意', '非常不愿意'],
    sort_order: 15
  }
];

const insertStmt = db.prepare(`
  INSERT INTO questions (question_text, question_type, options, sort_order)
  VALUES (?, ?, ?, ?)
`);

for (const q of sampleQuestions) {
  insertStmt.run(q.question_text, q.question_type, JSON.stringify(q.options), q.sort_order);
}

console.log('✅ Database initialized successfully!');
console.log('✅ Default admin created: admin / admin123');
console.log(`✅ ${sampleQuestions.length} sample questions inserted`);

db.close();
