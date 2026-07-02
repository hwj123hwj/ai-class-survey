/**
 * 评分引擎 — 将答卷数据转化为成熟度诊断报告
 */

// 五大维度定义
export const DIMENSIONS = [
  { key: 'strategy', label: '战略', fullLabel: '战略认知与共识', level: 1, range: [1, 3], color: '#3B82F6', icon: '🎯' },
  { key: 'scene', label: '场景', fullLabel: '场景试点验证', level: 2, range: [4, 6], color: '#10B981', icon: '🧪' },
  { key: 'process', label: '流程', fullLabel: '流程渗透与普及', level: 3, range: [7, 9], color: '#8B5CF6', icon: '🔄' },
  { key: 'platform', label: '平台', fullLabel: '平台规模与投入', level: 4, range: [10, 12], color: '#F59E0B', icon: '🏗️' },
  { key: 'business', label: '业务', fullLabel: '业务重塑与输出', level: 5, range: [13, 15], color: '#EF4444', icon: '🚀' },
] as const;

// 等级定义
export const LEVELS = [
  { level: 1, name: '认知探索期', shortName: 'L1 · 认知', desc: 'AI 刚刚进入视野，认知先行' },
  { level: 2, name: '试点验证期', shortName: 'L2 · 试点', desc: '单点突破，跑通可量化样板' },
  { level: 3, name: '流程嵌入期', shortName: 'L3 · 嵌入', desc: 'AI 进入组织流程，全员上手' },
  { level: 4, name: '规模扩展期', shortName: 'L4 · 规模', desc: '样板复制成平台，组织级操作系统' },
  { level: 5, name: '业务重塑期', shortName: 'L5 · 重塑', desc: 'AI 成为护城河，商业模型重构' },
] as const;

export interface DimensionScore {
  key: string;
  label: string;
  fullLabel: string;
  score: number;       // 3题总分，满分15
  average: number;     // 平均分 1-5
  status: 'established' | 'in_progress' | 'not_started';
  statusLabel: string;
  questions: QuestionScore[];
  color: string;
  icon: string;
  analysis: string;    // 维度诊断分析
  levelMatch: number;  // 该维度落在哪一级
  levelMatchName: string;
}

export interface QuestionScore {
  id: number;
  questionText: string;
  sortOrder: number;
  answerValue: string;
  score: number;
  theme: string;       // 问题主题，如"一把手态度"
  interpretation: string; // 答案解读
}

export interface GapItem {
  point: string;
  current: string;
  problem: string;
  severity: 'high' | 'medium' | 'low';
}

export interface InsightItem {
  title: string;
  content: string;
}

export interface ReportData {
  sessionId: string;
  userName: string;
  userCompany: string;
  evaluatedAt: string;    // ISO 8601 评测完成时间
  dimensions: DimensionScore[];
  totalScore: number;     // 75分制（= rawTotal，满分75）
  rawTotal: number;       // 原始 15-75
  level: number;
  levelName: string;
  levelShortName: string;
  levelDesc: string;
  subStage: string;       // 早期/中期/突破
  gaps: GapItem[];
  insights: InsightItem[];
  actionPlan: {
    tonight: string[];
    thisWeek: string[];
    thisMonth: string[];
  };
}

// 选项 A-E → 分值 1-5
export function parseScore(answerValue: string): number {
  if (!answerValue) return 1;
  const match = answerValue.match(/^([A-E])/);
  if (match) {
    return match[1].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  }
  return 1;
}

// 每个问题的主题（按 sort_order）
const QUESTION_THEMES: Record<number, string> = {
  1: '一把手态度', 2: '使用场景', 3: '内部共识',
  4: '跑通项目', 5: '专职团队', 6: 'ROI 清晰度',
  7: '流程渗透', 8: '员工普及', 9: '使用规范',
  10: '统一平台', 11: '复制速度', 12: '年投入',
  13: '新业务', 14: '核心竞争力', 15: '行业输出',
};

// 根据题号和得分给出答案解读
function getInterpretation(sortOrder: number, score: number): string {
  const interpretations: Record<number, Record<number, string>> = {
    1: { 1: '未表态', 2: '口头支持', 3: '态度支持', 4: '亲自试用', 5: '战略级投入' },
    2: { 1: '零星尝试', 2: '个别部门', 3: '多部门日常', 4: '核心业务', 5: '全员工作流' },
    3: { 1: '无共识', 2: '方向模糊', 3: '有方向缺路径', 4: '有路径', 5: '路径清晰' },
    4: { 1: '无试点', 2: '概念验证', 3: '1-2个效果不明', 4: '有可量化样板', 5: '多个标杆' },
    5: { 1: '无专人', 2: '兼职无团队', 3: '小团队', 4: '专职团队', 5: 'Center of Excellence' },
    6: { 1: '无感', 2: '凭感觉', 3: '初步估算', 4: '可量化', 5: '清晰 ROI' },
    7: { 1: '未进流程', 2: '个人效率工具', 3: '部分流程', 4: '核心流程', 5: '全流程嵌入' },
    8: { 1: '<5%', 2: '20-40%', 3: '40-60%', 4: '60-80%', 5: '>80%' },
    9: { 1: '无规范', 2: '各自摸索', 3: '局部规范', 4: '统一规范', 5: '持续迭代' },
    10: { 1: '无平台', 2: '各自用工具', 3: '部分统一', 4: '统一入口', 5: '组织级平台' },
    11: { 1: '无法复制', 2: '跑通复制不动', 3: '有限复制', 4: '快速复制', 5: '规模化复制' },
    12: { 1: '无预算', 2: '<50万', 3: '50-200万', 4: '200-500万', 5: '>500万' },
    13: { 1: '内部提效', 2: '探索新业务', 3: '新业务雏形', 4: '新业务增长', 5: '商业模式重构' },
    14: { 1: '辅助工具', 2: '局部差异', 3: '核心差异', 4: '竞争壁垒', 5: '护城河' },
    15: { 1: '还在摸索', 2: '内部标杆', 3: '行业分享', 4: '对外输出', 5: '行业引领' },
  };
  return interpretations[sortOrder]?.[score] || '-';
}

// 维度落在哪一级
function getDimensionLevel(score: number): { level: number; name: string } {
  if (score >= 12) return { level: 5, name: '业务重塑' };
  if (score >= 9) return { level: 4, name: '规模扩展' };
  if (score >= 6) return { level: 3, name: '流程嵌入' };
  if (score >= 4) return { level: 2, name: '试点验证' };
  return { level: 1, name: '认知探索' };
}

// 生成维度诊断分析
function generateDimensionAnalysis(dim: typeof DIMENSIONS[number], score: number, status: string): string {
  const analyses: Record<string, Record<string, string>> = {
    strategy: {
      established: '一把手表态支持、多部门日常在用，说明 AI 已经进入议事日程。卡点在共识：有方向但缺路径——大家都觉得该做，却说不清“AI 具体帮我们做成哪件事”。认知的最后一公里，是把“要做”翻译成“先做哪一个”。',
      in_progress: '组织对 AI 已有基本认知，但尚未形成统一战略语言和执行路径。高管层态度积极，基层却不知道怎么落地。下一步需要把认知转化为可试点的场景清单。',
      not_started: 'AI 在组织内还停留在“听说过”阶段，缺乏顶层推动和统一认知。如果一把手不亲自表态、不设定方向，AI 很容易沦为局部员工的个人工具，无法形成组织级变革。',
    },
    scene: {
      established: '你已经跑通了可量化的 AI 样板，有专人负责、ROI 清晰。这是最难的“从 0 到 1”。接下来要避免“每个场景从头来一遍”，把样板能力沉淀为可复制的打法。',
      in_progress: '有 1–2 个试点但效果不明、没有专人盯、ROI 靠感觉——这三条凑在一起，等于“试点没真正跑通”。试点的意义不在于“做过”，而在于能不能拿出一个可量化、可复述的结果。没有这个结果，往上任何一级都失去支点。',
      not_started: 'AI 在组织内尚无真正跑通的样板。没有“1”，L3 嵌入、L4 复制全都失去支点。建议从六大场景中选一个 ROI 最容易讲清的，集中资源跑出一个可量化成果。',
    },
    process: {
      established: 'AI 已经嵌入核心业务流程，员工普及率高、使用规范统一。组织开始从“个人提效”走向“流程重构”。下一步是扩大覆盖范围，让 AI 成为业务流的默认配置。',
      in_progress: 'AI 还停在“个人效率工具”，没进核心业务流程；普及率不高、各自摸索、没有统一规范。这是 AI 第一次真正“进组织”——开始接住流程里“上传下达”的环节。这根轴落后是“场景”没跑通的必然结果。',
      not_started: 'AI 尚未进入组织流程，价值锁在个别员工手里，规模效应出不来。没有可复制的样板，就没有可嵌入的流程。建议先回到场景层，把“1”跑通。',
    },
    platform: {
      established: 'AI 已经长成组织级平台：统一工具入口、快速复制、投入清晰。平台成为新组织的操作系统，数据和经验开始聚合，组织级能力逐步成型。',
      in_progress: '工具各自为政、第一个还没真正跑通何谈复制、专项预算不足。这根轴是 AI 从“几个场景”长成“组织级平台”的关键。现阶段不必焦虑，把资源收回到“场景”，先让“1”站得住。',
      not_started: 'AI 工具碎片化，没有统一平台，数据和经验无法聚合。这是 L4 规模扩展的前提，但在 L3 之前不必过早投入大平台，先让样板跑通更重要。',
    },
    business: {
      established: 'AI 已经成为对外差异化能力和行业输出。组织已经被 AI 重新长了一遍，AI 本身成为护城河。这是 AI Native 的终局状态。',
      in_progress: 'AI 目前主要是“内部提效”的辅助工具，还没成为对外卖点或差异化能力。这根轴是 AI Native 的终局：组织已经被 AI 重新长了一遍。把它当方向感即可——今天跑通的每一个单点，都是将来这套新组织的零件。',
      not_started: 'AI 尚未与业务重塑挂钩，停留在内部效率层面。这是 L5 的目标，需要前面的 L1–L4 都扎实后才能长出。当前不必强求，先把基础打牢。',
    },
  };
  return analyses[dim.key]?.[status] || `${dim.fullLabel}得 ${score}/15，处于${status === 'established' ? '已建立' : status === 'in_progress' ? '进行中' : '未启动'}阶段。`;
}

// 根据 sort_order 确定维度
export function getDimensionKey(sortOrder: number): string {
  for (const dim of DIMENSIONS) {
    if (sortOrder >= dim.range[0] && sortOrder <= dim.range[1]) {
      return dim.key;
    }
  }
  return 'strategy';
}

// 维度状态判定
function getDimensionStatus(score: number): { status: 'established' | 'in_progress' | 'not_started'; label: string } {
  if (score >= 9) return { status: 'established', label: '已建立' };
  if (score >= 5) return { status: 'in_progress', label: '进行中' };
  return { status: 'not_started', label: '未启动' };
}

// 成熟度定级 — 总分区间查表（文档规则）
function determineLevel(rawTotal: number): { level: number; subStage: string } {
  if (rawTotal >= 68) {
    if (rawTotal >= 73) return { level: 5, subStage: '突破' };
    if (rawTotal >= 70) return { level: 5, subStage: '中期' };
    return { level: 5, subStage: '早期' };
  }
  if (rawTotal >= 56) {
    if (rawTotal >= 64) return { level: 4, subStage: '突破' };
    if (rawTotal >= 60) return { level: 4, subStage: '中期' };
    return { level: 4, subStage: '早期' };
  }
  if (rawTotal >= 41) {
    if (rawTotal >= 52) return { level: 3, subStage: '突破' };
    if (rawTotal >= 48) return { level: 3, subStage: '中期' };
    return { level: 3, subStage: '早期' };
  }
  if (rawTotal >= 26) {
    if (rawTotal >= 37) return { level: 2, subStage: '突破' };
    if (rawTotal >= 32) return { level: 2, subStage: '中期' };
    return { level: 2, subStage: '早期' };
  }
  // L1: 15-25
  if (rawTotal >= 22) return { level: 1, subStage: '已建立' };
  if (rawTotal >= 19) return { level: 1, subStage: '中期' };
  return { level: 1, subStage: '早期' };
}

// 生成断层分析
function generateGaps(dimMap: Record<string, DimensionScore>, level: number): GapItem[] {
  const gaps: GapItem[] = [];
  const scene = dimMap['scene'];
  const process = dimMap['process'];
  const platform = dimMap['platform'];
  const business = dimMap['business'];

  if (scene.score <= 8) {
    const sceneAvg = scene.average;
    if (sceneAvg <= 2) {
      gaps.push({ point: '没有跑通的样板', current: '1-2个试点效果不明', problem: '没有"1"，L3嵌入、L4复制全都失去支点', severity: 'high' });
      gaps.push({ point: '没有专人盯', current: '兼职、无团队', problem: 'AI落地是"有人对结果负责"才成立的事，兼职必然让位于本职', severity: 'high' });
      gaps.push({ point: 'ROI算不清', current: '全凭感觉', problem: '无法量化就无法争取资源、无法复制、无法对上汇报', severity: 'high' });
    } else {
      gaps.push({ point: '试点效果待量化', current: '有试点但ROI不清晰', problem: '没有可量化的结果，试点无法转化为组织级决策依据', severity: 'medium' });
    }
  }

  if (process.score <= 6) {
    gaps.push({ point: '没进业务流程', current: '停在个人效率工具', problem: '价值锁在个别员工手里，规模效应出不来', severity: process.score <= 4 ? 'high' : 'medium' });
    gaps.push({ point: '缺统一规范', current: '各自摸索', problem: '经验无法沉淀，新人重复踩坑，普及到不了60%+', severity: 'medium' });
  }

  if (platform.score <= 6) {
    gaps.push({ point: '工具碎片化', current: '各自用不同工具', problem: '无法形成组织级AI能力，数据和经验无法聚合', severity: 'medium' });
  }

  // 兜底：至少保证一个断层点
  if (gaps.length === 0) {
    gaps.push({
      point: '向上跃迁的确定性不足',
      current: `当前 L${level}，各维度相对均衡`,
      problem: '没有明显短板，也意味着没有明确的“最低垂果实”。需要主动选择下一个突破口，否则容易停留在舒适区。',
      severity: 'low',
    });
  }

  return gaps;
}

// 注意：generateGaps 第二个参数 level 用于兜底

// 生成核心洞察
function generateInsights(dimMap: Record<string, DimensionScore>, level: number): InsightItem[] {
  const insights: InsightItem[] = [];
  const strategy = dimMap['strategy'];
  const scene = dimMap['scene'];

  if (strategy.score >= 9 && scene.score <= 8) {
    insights.push({
      title: '认知到位，组织没动',
      content: `战略得分${strategy.score}/15，认知已建立。但场景仅${scene.score}/15——你认同"AI重要"，但还没把它当成"重构组织的事"来推。AI Native不是给现有组织加几个工具，是用AI把组织重新长一遍。先让一个人、在一个场景里、跑出一个数——这是组织重构的第一刀。`,
    });
  }

  if (scene.score <= 7) {
    insights.push({
      title: 'ROI凭感觉 = 试点必然散掉',
      content: '说不清回报的试点，撑不过三个月。没人算ROI，再好的试点也会在预算评审时失去话语权。选场景的第一标准是"结果能不能量化"，不是"看起来酷不酷"。',
    });
  }

  if (strategy.score >= 7 && scene.score <= 6) {
    insights.push({
      title: '老板不亲自用 = AI Native最大的天花板',
      content: '表态支持只是态度，亲自用一段才有体感。CEO最该靠AI拿回的是信息权——绕过层层传递、绕过报喜不报忧的中间层，直接拿到一手数据和判断。老板自己先体会到信息直达，组织才可能从金字塔变成网状。',
    });
  }

  if (level >= 3) {
    insights.push({
      title: '样板已跑通，下一步是复制',
      content: '你已经过了最难的"从0到1"。现在要做的是把跑通的样板变成组织能力——沉淀规范、统一平台、让更多团队复用。谨防"每个场景从头来一遍"的陷阱。',
    });
  }

  // 兜底：至少保证一条洞察
  if (insights.length === 0) {
    const weakest = Object.values(dimMap).sort((a, b) => a.score - b.score)[0];
    insights.push({
      title: `${weakest.fullLabel}是当前最该补的板`,
      content: `你的${weakest.fullLabel}得分最低（${weakest.score}/15），对应 L${weakest.levelMatch} ${weakest.levelMatchName}。先把这根轴拉起来，整体成熟度才会自然向上跃迁。`,
    });
  }

  return insights;
}

// 生成行动建议
function generateActionPlan(level: number, subStage: string, dimMap: Record<string, DimensionScore>): ReportData['actionPlan'] {
  const userName = '';
  return {
    tonight: [
      '老板亲自上手：自己装一个AI工具（如EasyClaw），挑一件最头疼的小事丢给它跑',
      '目标只有一个：建立体感，亲手体会信息直达',
    ],
    thisWeek: [
      '从六大场景（数据运营/战略执行/战略制定/组织与人效/系统开发/创始人IP）中选定1个最易量化ROI的',
      '指定1名专职负责人，对结果负责',
      '提前定好这次要量化的那个数（省了多少人/时间/钱）',
    ],
    thisMonth: [
      '把选定的场景跑出一个能复述的ROI成果',
      '启动入企培训（启航班/领航班），让团队全员上手Vibe Coding',
      '沉淀使用规范和最佳实践，准备向第二个场景复制',
    ],
  };
}

// 主评分函数
export function generateReport(
  sessionId: string,
  userName: string,
  userCompany: string,
  evaluatedAt: string,
  answers: Array<{
    questionId: number;
    questionText: string;
    sortOrder: number;
    answerValue: string;
  }>
): ReportData {
  // 按维度分组
  const dimQuestions = new Map<string, QuestionScore[]>();

  for (const ans of answers) {
    const dimKey = getDimensionKey(ans.sortOrder);
    const score = parseScore(ans.answerValue);

    if (!dimQuestions.has(dimKey)) {
      dimQuestions.set(dimKey, []);
    }
    dimQuestions.get(dimKey)!.push({
      id: ans.questionId,
      questionText: ans.questionText,
      sortOrder: ans.sortOrder,
      answerValue: ans.answerValue,
      score,
      theme: QUESTION_THEMES[ans.sortOrder] || '',
      interpretation: getInterpretation(ans.sortOrder, score),
    });
  }

  // 计算各维度得分
  const dimMap: Record<string, DimensionScore> = {};
  let rawTotal = 0;

  for (const dim of DIMENSIONS) {
    const questions = dimQuestions.get(dim.key) || [];
    const dimScore = questions.reduce((sum, q) => sum + q.score, 0);
    const average = questions.length > 0 ? dimScore / questions.length : 1;
    const { status, label } = getDimensionStatus(dimScore);
    const { level: dimLevel, name: dimLevelName } = getDimensionLevel(dimScore);

    rawTotal += dimScore;

    dimMap[dim.key] = {
      key: dim.key,
      label: dim.label,
      fullLabel: dim.fullLabel,
      score: dimScore,
      average: Math.round(average * 10) / 10,
      status,
      statusLabel: label,
      questions,
      color: dim.color,
      icon: dim.icon,
      analysis: generateDimensionAnalysis(dim, dimScore, status),
      levelMatch: dimLevel,
      levelMatchName: dimLevelName,
    };
  }

  // 定级 — 用 rawTotal 按总分区间查表
  const { level, subStage } = determineLevel(rawTotal);
  const levelInfo = LEVELS[level - 1];

  // 总分即 rawTotal（满分 75）
  const totalScore = rawTotal;

  // 生成分析内容
  const gaps = generateGaps(dimMap, level);
  const insights = generateInsights(dimMap, level);
  const actionPlan = generateActionPlan(level, subStage, dimMap);

  return {
    sessionId,
    userName,
    userCompany,
    evaluatedAt,
    dimensions: DIMENSIONS.map(d => dimMap[d.key]),
    totalScore,
    rawTotal,
    level,
    levelName: levelInfo.name,
    levelShortName: levelInfo.shortName,
    levelDesc: levelInfo.desc,
    subStage,
    gaps,
    insights,
    actionPlan,
  };
}
