import { pillarToString } from "../bazi/ganzhi";
import type { LuckPeriodRange } from "./periodResolver";
import type { TransitContext } from "./transitCalculator";
import type {
  LuckCategory,
  LuckPeriod,
  LuckScore,
  TransitSummary,
  PeriodInsights,
} from "./types";
import { LUCK_CATEGORY_COLORS, LUCK_CATEGORY_LABELS } from "./types";

export function scoreToLevel(score: number): string {
  if (score >= 90) return "极佳";
  if (score >= 80) return "很好";
  if (score >= 70) return "平稳偏好";
  if (score >= 60) return "普通";
  if (score >= 50) return "需要调整";
  return "谨慎";
}

const FORBIDDEN_WORDS = [
  "一定", "必然", "注定", "包发财", "必脱单", "脱单", "复合", "正缘",
  "必定遇到", "会发财", "投资必赚", "彩票中奖",
];

export function containsForbiddenText(text: string): boolean {
  return FORBIDDEN_WORDS.some((w) => text.includes(w));
}

type SubCategory = Exclude<LuckCategory, "overall">;

function tier(score: number): "high" | "mid" | "low" {
  if (score >= 75) return "high";
  if (score >= 60) return "mid";
  return "low";
}

const CATEGORY_FOCUS: Record<SubCategory, string> = {
  love: "感情互动与表达",
  wealth: "财务规划与资源流动",
  career: "工作推进与职场节奏",
  study: "学习吸收与知识整理",
  social: "人际联络与协作沟通",
};

function periodOpener(
  period: LuckPeriod,
  dateLabel: string,
  startDate: string,
  endDate: string,
  transit: TransitContext,
): string {
  if (period === "day") {
    return `今日（${startDate}）流日${transit.day.pillar}，${transit.day.stemTenGod}引动当日主题。`;
  }
  if (period === "week") {
    return `本周（${startDate} 至 ${endDate}）以流月${transit.month.pillar}与七日流日聚合塑形，整体节奏${dateLabel === "本周" ? "围绕当前周" : `对应${dateLabel}`}展开。`;
  }
  if (period === "month") {
    return `本月（${dateLabel}）流月${transit.month.pillar}为主导，${transit.month.stemTenGod}牵动全月${transit.month.stemElement}气。`;
  }
  return `${startDate.slice(0, 4)}年流年${transit.year.pillar}（${transit.year.stemTenGod}）为全年主轴，结合大运与十二流月趋势研判。`;
}

function evidenceSentences(evidence: string[], category: SubCategory): string {
  const filtered = evidence.filter((e) => e.length > 4);
  const pick = filtered.slice(0, 2);
  if (pick.length < 2 && filtered.length > 0) {
    pick.push(filtered[filtered.length - 1]);
  }
  if (pick.length === 0) {
    return `从命局结构看，${CATEGORY_FOCUS[category]}需结合当下节奏循序渐进，不宜急于求成。`;
  }
  return pick.join("；") + "。";
}

function relationTone(evidence: string[]): string {
  const hasClash = evidence.some((e) => e.includes("冲") || e.includes("放缓"));
  const hasCombine = evidence.some((e) => e.includes("合") || e.includes("连接"));
  if (hasClash) {
    return "存在冲动关系时，宜节奏放缓、沟通留余地、不急着做决定。";
  }
  if (hasCombine) {
    return "合局较明显时，适合连接、关系缓和与合作推进。";
  }
  return "";
}

function tierNarrative(category: SubCategory, t: "high" | "mid" | "low"): string {
  const map: Record<SubCategory, Record<string, string>> = {
    love: {
      high: "情感流动感较好，适合把话说清楚，也给彼此一点回应空间。",
      mid: "感情整体平稳，宜慢慢沟通、倾听需求，避免带着情绪下判断。",
      low: "情绪可能更敏感，关系中宜先照顾自身节奏，再谈深层变化。",
    },
    wealth: {
      high: "财务节奏偏顺，适合整理预算、检查支出并做中期规划。",
      mid: "财务宜稳健，大额决定多比较几次，区分必要与冲动消费。",
      low: "开支欲望可能偏强，先理清账目，暂缓高风险决定。",
    },
    career: {
      high: "事业适合稳步推进，先解决手头具体问题，再谈大的调整。",
      mid: "工作节奏宜稳不宜急，汇报进展、补齐细节会更有效。",
      low: "职场压力感可能偏重，任务拆解后逐步完成，避免和规则硬碰硬。",
    },
    study: {
      high: "学习状态较易集中，适合整理笔记、复盘错题、建立知识框架。",
      mid: "学习宜系统复习，固定每日短时段专注，比突击更有效。",
      low: "注意力可能易分散，缩短单次学习时长、用清单拆小任务。",
    },
    social: {
      high: "人际互动较顺，适合主动联系，倾听比说服更重要。",
      mid: "社交保持平常心即可，遇到分歧时留一点余地。",
      low: "人际可能略紧绷，放慢语速、减少评判，小误会宜早澄清。",
    },
  };
  return map[category][t];
}

function padToMinLength(text: string, minLen: number): string {
  let s = text;
  const pads = [
    " 把趋势当作生活参考，用行动验证会比空想更有收获。",
    " 保持平常心，遇到波动时先稳住节奏再调整策略。",
    " 命理提示的是倾向，不是定论，关键仍在你如何回应。",
  ];
  let i = 0;
  while (s.length < minLen && i < pads.length) {
    s += pads[i++];
  }
  return s;
}

interface BuildLuckScoreInput {
  category: SubCategory;
  score: number;
  evidence: string[];
  focusArea?: string;
  period: LuckPeriod;
  dateLabel: string;
  startDate: string;
  endDate: string;
  transit: TransitContext;
}

export function buildLuckScoreText(
  input: BuildLuckScoreInput,
): Pick<LuckScore, "summary" | "advice" | "keywords"> {
  const t = tier(input.score);
  const opener = periodOpener(
    input.period,
    input.dateLabel,
    input.startDate,
    input.endDate,
    input.transit,
  );
  const ev = evidenceSentences(input.evidence, input.category);
  const rel = relationTone(input.evidence);
  const narrative = tierNarrative(input.category, t);

  let summary = `${opener}${narrative}${ev}`;
  if (rel) summary += rel;
  if (input.focusArea === input.category) {
    summary += `你当前关注${LUCK_CATEGORY_LABELS[input.category]}，可优先落实以下建议。`;
  }
  summary = padToMinLength(summary, 120);
  if (summary.length > 320) summary = summary.slice(0, 318) + "…";

  const advice: string[] = [];
  if (input.evidence.some((e) => e.includes("冲"))) {
    advice.push("节奏放缓，沟通留余地");
  }
  if (input.evidence.some((e) => e.includes("合") || e.includes("连接"))) {
    advice.push("适合连接与合作推进");
  }
  if (input.transit.day.stemTenGod.includes("财") && input.category === "wealth") {
    advice.push("整理账目与预算安排");
  }
  if (
    (input.transit.day.stemTenGod === "正印" || input.transit.day.stemTenGod === "偏印") &&
    input.category === "study"
  ) {
    advice.push("固定时段复盘与整理笔记");
  }
  if (
    (input.transit.day.stemTenGod === "食神" || input.transit.day.stemTenGod === "伤官") &&
    (input.category === "social" || input.category === "love")
  ) {
    advice.push("表达前先倾听，语气宜柔和");
  }
  if (
    (input.transit.day.stemTenGod === "正官" || input.transit.day.stemTenGod === "七杀") &&
    input.category === "career"
  ) {
    advice.push("推进任务宜分步执行");
  }

  const fallbackAdvice: Record<SubCategory, string[][]> = {
    love: [["多给对方回应", "表达前先倾听", "避免情绪化决定"], ["安排轻松相处", "用具体行动代替猜测"], ["先照顾情绪", "不宜急着下结论"]],
    wealth: [["整理预算", "检查固定支出"], ["大额消费多比较", "稳健优先"], ["暂缓高风险决定", "理清账目"]],
    career: [["推进手头任务", "整理优先级"], ["补齐细节", "沟通务实"], ["任务拆解", "避免硬碰硬"]],
    study: [["系统复习", "整理笔记"], ["固定学习时段", "基础再过一遍"], ["缩短单次时长", "任务拆小"]],
    social: [["主动联系", "倾听对方"], ["保持平常心", "留余地"], ["放慢节奏", "简单澄清误会"]],
  };
  const fb = fallbackAdvice[input.category][t === "high" ? 0 : t === "mid" ? 1 : 2];
  for (const a of fb) {
    if (advice.length < 4 && !advice.includes(a)) advice.push(a);
  }

  const keywords =
    t === "high"
      ? ["流动顺畅", "适合行动", input.transit.month.stemElement + "气助势"]
      : t === "mid"
        ? ["稳中求进", "保持节奏"]
        : ["放慢脚步", "调整状态"];

  for (const text of [summary, ...advice]) {
    if (containsForbiddenText(text)) {
      throw new Error(`文案包含禁用词: ${text}`);
    }
  }

  return { summary, advice: advice.slice(0, 4), keywords };
}

export function buildLuckScore(input: BuildLuckScoreInput): LuckScore {
  const level = scoreToLevel(input.score);
  const text = buildLuckScoreText(input);

  return {
    category: input.category,
    label: LUCK_CATEGORY_LABELS[input.category],
    score: input.score,
    level,
    color: LUCK_CATEGORY_COLORS[input.category],
    evidence: input.evidence,
    ...text,
  };
}

export function buildTransitSummary(
  transit: TransitContext,
  range: LuckPeriodRange,
): TransitSummary {
  const elements = Object.entries(transit.elementImpact)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([el]) => el);

  const gods = [
    transit.year.stemTenGod,
    transit.month.stemTenGod,
    transit.day.stemTenGod,
    transit.currentLuckCycle?.stemTenGod,
  ].filter(Boolean) as string[];

  const godCount: Record<string, number> = {};
  for (const g of gods) godCount[g] = (godCount[g] ?? 0) + 1;
  const dominantTenGods = Object.entries(godCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([g]) => g);

  const importantRelations = [
    ...transit.relations.dayRelations,
    ...transit.relations.monthRelations,
    ...transit.relations.yearRelations,
  ]
    .slice(0, 4)
    .map((r) => r.description);

  return {
    yearPillar: transit.year.pillar,
    monthPillar: range.period !== "year" ? transit.month.pillar : transit.month.pillar,
    dayPillar: range.period === "day" || range.period === "week" ? transit.day.pillar : undefined,
    luckCyclePillar: transit.currentLuckCycle
      ? pillarToString(transit.currentLuckCycle.pillar)
      : undefined,
    dominantElements: elements,
    dominantTenGods,
    importantRelations,
  };
}

export function buildPeriodInsights(
  period: LuckPeriod,
  range: LuckPeriodRange,
  scores: LuckScore[],
  transit: TransitContext,
): PeriodInsights {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const bestTimes: string[] = [];
  const cautionTimes: string[] = [];

  if (period === "week") {
    bestTimes.push(`本周${best.label}方向较突出（${best.score}分）`);
    cautionTimes.push(`本周${worst.label}宜保守（${worst.score}分）`);
  } else if (period === "month") {
    bestTimes.push(`本月上旬宜布局，中旬流月${transit.month.pillar}主导`);
    cautionTimes.push(`本月下旬留意${worst.label}波动`);
  } else if (period === "year") {
    bestTimes.push(`${range.startDate.getFullYear()}年${best.label}趋势相对平稳`);
    cautionTimes.push(`${range.startDate.getFullYear()}年${worst.label}需留神`);
  } else {
    bestTimes.push(`今日${best.label}较顺（${best.score}分）`);
    cautionTimes.push(`今日${worst.label}宜留意（${worst.score}分）`);
  }

  let mainTheme = "";
  if (period === "day") {
    mainTheme = `今日流日${transit.day.pillar}，${transit.day.stemTenGod}引动一日节奏`;
  } else if (period === "week") {
    mainTheme = `本周以流月${transit.month.pillar}为底色，七日流日共同塑形`;
  } else if (period === "month") {
    mainTheme = `本月流月${transit.month.pillar}（${transit.month.stemTenGod}）主导全月主题`;
  } else {
    mainTheme = `${range.startDate.getFullYear()}年流年${transit.year.pillar}定义全年主轴`;
  }

  const actionSuggestion =
    best.score >= 70
      ? `优先把握${best.label}方向，${best.advice[0] ?? "稳步推进"}`
      : `整体宜稳中求进，${worst.advice[0] ?? "放慢节奏"}`;

  return { bestTimes, cautionTimes, mainTheme, actionSuggestion };
}

export function buildHighlightsAndCautions(
  scores: LuckScore[],
): { highlights: string[]; cautions: string[] } {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const highlights = [
    `${best.label}方向相对突出（${best.score}分），${best.keywords[0] ?? "可优先把握"}`,
    sorted[1] && sorted[1].score >= 70
      ? `${sorted[1].label}也较平稳，适合同步推进`
      : "其他方向宜循序渐进",
  ].filter(Boolean) as string[];

  const cautions = [
    worst.score < 65
      ? `${worst.label}方面宜多留意（${worst.score}分），${worst.advice[0] ?? "放慢节奏"}`
      : "整体无显著短板，保持现有节奏即可",
  ];

  return { highlights, cautions };
}
