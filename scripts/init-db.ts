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

// 企业 AI Native 成熟度诊断 - 15道题
const sampleQuestions = [
  // 第一维度：战略认知（Q1-Q3）
  {
    question_text: '您所在企业的最高决策者（CEO/总经理/董事长）对 AI 转型的态度是？',
    question_type: 'radio',
    options: [
      'A. 基本没有关注，AI 不在议程上',
      'B. 偶尔提到 AI，但没有明确方向',
      'C. 公开表态支持，鼓励大家探索',
      'D. 已将 AI 列入年度重点工作',
      'E. 亲自推动，有明确目标、节奏和资源投入'
    ],
    sort_order: 1
  },
  {
    question_text: '目前 AI 工具在贵公司的使用范围是？',
    question_type: 'radio',
    options: [
      'A. 几乎没有人在用',
      'B. 少数几个人自发在用',
      'C. 多个部门已经在日常工作中使用',
      'D. 已经纳入部分团队的工作规范',
      'E. 全员普及，已成为组织级工作方式'
    ],
    sort_order: 2
  },
  {
    question_text: '公司内部对于"为什么要推 AI"的共识程度如何？',
    question_type: 'radio',
    options: [
      'A. 没有共识，大家各有看法',
      'B. 觉得有用，但多数人在观望',
      'C. 大方向认同，但具体从哪里做不清楚',
      'D. 明确了优先场景和推进顺序',
      'E. 已形成统一目标、落地路径和考核机制'
    ],
    sort_order: 3
  },
  // 第二维度：场景试点（Q4-Q6）
  {
    question_text: '目前公司是否已经在某个具体业务场景中跑过 AI 试点？',
    question_type: 'radio',
    options: [
      'A. 没有，连想法都还很模糊',
      'B. 有想法，但还没有开始',
      'C. 有 1-2 个试点，但效果说不清楚',
      'D. 跑通了 1-2 个场景，有明确收益',
      'E. 多个场景稳定产生业务价值，可以复制'
    ],
    sort_order: 4
  },
  {
    question_text: '公司是否有专人负责 AI 试点项目的推进？',
    question_type: 'radio',
    options: [
      'A. 没有人负责',
      'B. 有人临时跟进，但不稳定',
      'C. 兼职跟进，没有固定团队',
      'D. 有明确负责人和跨部门小组',
      'E. 有专职团队，有常态化推进机制'
    ],
    sort_order: 5
  },
  {
    question_text: 'AI 试点项目的投入产出（ROI）是否有明确衡量？',
    question_type: 'radio',
    options: [
      'A. 完全没有评估',
      'B. 主要靠感觉判断',
      'C. 有初步指标，但没有持续追踪',
      'D. 有明确指标，定期复盘',
      'E. 已能量化业务收益，并指导后续资源投入决策'
    ],
    sort_order: 6
  },
  // 第三维度：流程嵌入（Q7-Q9）
  {
    question_text: 'AI 在贵公司是否已经进入核心业务流程？',
    question_type: 'radio',
    options: [
      'A. 完全没有',
      'B. 主要用来帮个人提升效率（写文案、查资料等）',
      'C. 已进入部分非核心流程（如行政、内部沟通）',
      'D. 已嵌入关键业务流程（如销售、客服、产品）',
      'E. AI 已经重构了核心流程和团队协作方式'
    ],
    sort_order: 7
  },
  {
    question_text: '粗略估计，贵公司员工中有多少比例在高频使用 AI 工具（每周 3 次以上）？',
    question_type: 'radio',
    options: [
      'A. 极少数，不到 5%（个别人自发在用）',
      'B. 大约 5%-20%',
      'C. 大约 20%-40%',
      'D. 大约 40%-70%',
      'E. 超过 70%'
    ],
    sort_order: 8
  },
  {
    question_text: '公司是否有统一的 AI 使用规范或最佳实践指引？',
    question_type: 'radio',
    options: [
      'A. 没有任何规范',
      'B. 各自摸索，经验没有沉淀',
      'C. 有一些零散总结，但没有系统化',
      'D. 有统一规范、提示词模板和内部培训',
      'E. 有持续更新的组织级方法论和知识库'
    ],
    sort_order: 9
  },
  // 第四维度：平台与投入（Q10-Q12）
  {
    question_text: '贵公司在 AI 工具/平台的使用上是什么状态？',
    question_type: 'radio',
    options: [
      'A. 没有使用任何 AI 工具',
      'B. 员工各自找免费工具用',
      'C. 各部门各自采购，工具碎片化',
      'D. 有统一的工具入口或内部平台',
      'E. 已有统一 AI 工作台，数据和权限体系完整'
    ],
    sort_order: 10
  },
  {
    question_text: '已经验证有效的 AI 场景，能在公司内快速复制推广吗？',
    question_type: 'radio',
    options: [
      'A. 完全不具备复制能力',
      'B. 每个场景都需要从头摸索',
      'C. 第一个可复制的样板还没真正跑出来',
      'D. 已能推广到相似部门或流程',
      'E. 已有规模化复制机制，新场景落地周期短'
    ],
    sort_order: 11
  },
  {
    question_text: '公司每年在 AI 相关的专项投入（工具、培训、人员）大约是多少？',
    question_type: 'radio',
    options: [
      'A. 几乎没有专项投入',
      'B. 少量临时预算，随用随批',
      'C. 专项预算不足 50 万',
      'D. 专项预算 50-200 万',
      'E. 有持续稳定的预算、专属团队和平台投入'
    ],
    sort_order: 12
  },
  // 第五维度：业务重塑（Q13-Q15）
  {
    question_text: 'AI 是否已经帮助贵公司探索出新的业务模式或服务方式？',
    question_type: 'radio',
    options: [
      'A. 没有，AI 还停留在辅助内部工作',
      'B. 只用于内部提效，不影响对外业务',
      'C. 已经开始辅助产品迭代或服务创新',
      'D. 已形成新的客户价值点或交付方式',
      'E. AI 已驱动出新的商业模式或收入来源'
    ],
    sort_order: 13
  },
  {
    question_text: 'AI 能力是否已经成为贵公司在行业中的差异化竞争优势？',
    question_type: 'radio',
    options: [
      'A. 完全不是，和行业水平差不多',
      'B. AI 只是效率辅助工具，不影响竞争力',
      'C. 在部分环节形成了效率优势',
      'D. 已形成明显差异化能力',
      'E. AI 已经成为核心护城河'
    ],
    sort_order: 14
  },
  {
    question_text: '贵公司是否有能力将 AI 实践经验对外输出或赋能客户/合作伙伴？',
    question_type: 'radio',
    options: [
      'A. 完全没有这个能力',
      'B. 自己还在摸索，谈不上输出',
      'C. 可以给客户展示 AI 应用案例',
      'D. 已能沉淀为解决方案提供给客户',
      'E. 可以向行业输出方法论、产品或服务'
    ],
    sort_order: 15
  }
];

const insertStmt = db.prepare(`
  INSERT INTO questions (question_text, question_type, options, sort_order)
  VALUES (?, ?, ?, ?)
`);

// Clear existing questions
db.prepare('DELETE FROM questions').run();

for (const q of sampleQuestions) {
  insertStmt.run(q.question_text, q.question_type, JSON.stringify(q.options), q.sort_order);
}

console.log('✅ Database initialized successfully!');
console.log('✅ Default admin created: admin / admin123');
console.log(`✅ ${sampleQuestions.length} questions inserted (企业 AI Native 成熟度诊断)`);

db.close();
