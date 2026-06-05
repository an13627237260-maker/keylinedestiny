import type { ZodiacSignInfo } from "./zodiac";

export type FortunePeriod = "daily" | "weekly" | "monthly" | "yearly";

export type ZodiacFortuneCategory =
  | "love"
  | "wealth"
  | "career"
  | "study"
  | "social"
  | "wellness";

export interface ZodiacFortune {
  seed: string;
  period: FortunePeriod;
  overallScore: number;
  scores: Record<ZodiacFortuneCategory, number>;
  interpretations: Record<ZodiacFortuneCategory, string>;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  themes: string[];
  summary: string;
  love: string;
  wealth: string;
  career: string;
  study: string;
  social: string;
  wellness: string;
}

const THEMES = [
  "沟通",
  "专注",
  "休息",
  "社交",
  "学习",
  "创意",
  "整理",
  "探索",
  "合作",
  "反思",
  "边界",
  "复盘",
];

const LUCKY_COLORS = [
  "晨雾白",
  "海盐蓝",
  "松石绿",
  "暖杏色",
  "月光银",
  "石榴红",
  "鼠尾草绿",
  "琥珀金",
  "鸢尾紫",
  "炭灰色",
];

const LUCKY_DIRECTIONS = [
  "东",
  "东南",
  "南",
  "西南",
  "西",
  "西北",
  "北",
  "东北",
];

const PERIOD_LABELS: Record<FortunePeriod, string> = {
  daily: "今日",
  weekly: "本周",
  monthly: "本月",
  yearly: "今年",
};

const CATEGORY_LABELS: Record<ZodiacFortuneCategory, string> = {
  love: "爱情",
  wealth: "财富",
  career: "事业",
  study: "学习",
  social: "人际",
  wellness: "身心",
};

const CATEGORY_FOCUS: Record<ZodiacFortuneCategory, string> = {
  love: "关系里的回应速度、表达方式和安全感需求会被放大，适合把真实感受说清楚，也给对方留出消化空间",
  wealth: "资源分配、消费节奏和长期储蓄意识更值得留心，适合先看现金流，再判断是否要追加投入",
  career: "任务优先级、协作边界和交付质量是重点，适合把目标拆细，先处理最影响进度的环节",
  study: "吸收新知识与复盘旧内容同样重要，适合用结构化笔记把零散信息整理成可反复使用的方法",
  social: "沟通场景会带来新的线索，但也容易因为话题切换太快而分心，适合少承诺、多确认",
  wellness: "身心状态需要稳定节律支撑，睡眠、饮食、运动和情绪缓冲都会影响整段周期的发挥",
};

const CATEGORY_ACTIONS: Record<ZodiacFortuneCategory, string> = {
  love: "把期待说成具体请求，比让对方猜测更有效；单身者可以增加轻松交流，有伴者适合共同安排一件可落地的小事",
  wealth: "重大支出先延迟一轮复核，日常花费则用清单管理；如果有收益机会，先看风险边界而不是只看回报想象",
  career: "先完成能形成结果的事项，再处理锦上添花的细节；遇到分歧时，用事实和时间节点对齐责任",
  study: "把学习目标拆成短时段练习，每次结束都留下复盘记录；难点不要硬背，优先找例题和应用场景",
  social: "适合主动维护可靠关系，但不必为了合群耗尽精力；对模糊邀约保持礼貌，也保留自己的节奏",
  wellness: "减少熬夜和情绪性消耗，给身体一个固定恢复窗口；若压力变重，先做低门槛活动恢复掌控感",
};

function stableHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function hashNumber(input: string): number {
  return Number.parseInt(stableHash(input), 16);
}

function pick<T>(seed: string, offset: number, list: readonly T[]): T {
  return list[hashNumber(`${seed}:${offset}`) % list.length];
}

function pickThemes(seed: string): string[] {
  const out: string[] = [];
  for (let i = 0; out.length < 3 && i < THEMES.length * 2; i++) {
    const item = pick(seed, i, THEMES);
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

function scoreFor(seed: string, category: ZodiacFortuneCategory): number {
  return 58 + (hashNumber(`${seed}:score:${category}`) % 36);
}

function scoreTone(score: number): string {
  if (score >= 85) return "整体助力较足，可以主动推进，但仍要保留复盘意识";
  if (score >= 74) return "节奏偏顺，适合稳步展开，不需要过度用力";
  if (score >= 65) return "机会与阻力并存，越是具体安排，越容易看到进展";
  return "节奏略慢，宜先稳住基础，再选择合适的切入点";
}

function buildInterpretation(input: {
  sign: ZodiacSignInfo;
  period: FortunePeriod;
  category: ZodiacFortuneCategory;
  score: number;
  theme: string;
  luckyDirection: string;
}): string {
  const label = CATEGORY_LABELS[input.category];
  const periodLabel = PERIOD_LABELS[input.period];
  return `${input.sign.name}${periodLabel}${label}分数为${input.score}分，${scoreTone(input.score)}。本项关键词是“${input.theme}”，结合${input.sign.element}象特质与${input.sign.modality}星座的行动方式来看，${CATEGORY_FOCUS[input.category]}。建议是：${CATEGORY_ACTIONS[input.category]}。幸运方位${input.luckyDirection}可作为日常选择的小提示，例如安排座位、散步路线或整理空间时顺手参考；它只用于娱乐型趋势提醒，不代表必然事件，也不会替代现实判断。`;
}

export function generateZodiacFortune(
  sign: ZodiacSignInfo,
  period: FortunePeriod,
  date: string,
): ZodiacFortune {
  const seed = stableHash(`${date}:${sign.id}:${period}`);
  const themes = pickThemes(seed);
  const luckyColor = pick(seed, 21, LUCKY_COLORS);
  const luckyDirection = pick(seed, 22, LUCKY_DIRECTIONS);
  const luckyNumber = 1 + (hashNumber(`${seed}:lucky-number`) % 9);

  const categories: ZodiacFortuneCategory[] = [
    "love",
    "wealth",
    "career",
    "study",
    "social",
    "wellness",
  ];
  const scores = Object.fromEntries(
    categories.map((category) => [category, scoreFor(seed, category)]),
  ) as Record<ZodiacFortuneCategory, number>;
  const overallScore = Math.round(
    categories.reduce((sum, category) => sum + scores[category], 0) /
      categories.length,
  );
  const interpretations = Object.fromEntries(
    categories.map((category, index) => [
      category,
      buildInterpretation({
        sign,
        period,
        category,
        score: scores[category],
        theme: themes[index % themes.length],
        luckyDirection,
      }),
    ]),
  ) as Record<ZodiacFortuneCategory, string>;

  const periodLabel = PERIOD_LABELS[period];
  const strongest = categories
    .map((category) => ({ category, score: scores[category] }))
    .sort((a, b) => b.score - a.score)[0].category;

  return {
    seed,
    period,
    overallScore,
    scores,
    interpretations,
    luckyColor,
    luckyNumber,
    luckyDirection,
    themes,
    summary: `${sign.name}${periodLabel}综合分 ${overallScore}。本次趋势由本地稳定算法生成，关键词为${themes.join("、")}；较强项是${CATEGORY_LABELS[strongest]}，幸运色${luckyColor}，幸运数字${luckyNumber}，幸运方位${luckyDirection}。`,
    love: interpretations.love,
    wealth: interpretations.wealth,
    career: interpretations.career,
    study: interpretations.study,
    social: interpretations.social,
    wellness: interpretations.wellness,
  };
}

export function analyzeZodiacCompatibility(
  signA: ZodiacSignInfo,
  signB: ZodiacSignInfo,
): { score: number; note: string } {
  const elementScore: Record<string, number> = {
    火火: 75,
    火风: 80,
    火土: 55,
    火水: 50,
    土土: 70,
    土水: 65,
    土风: 60,
    水水: 75,
    水风: 55,
    风风: 72,
  };
  const key = [signA.element, signB.element].sort().join("");
  const score = elementScore[key] ?? 60;
  return {
    score,
    note: "星座匹配为娱乐辅助，不代表关系结果",
  };
}
