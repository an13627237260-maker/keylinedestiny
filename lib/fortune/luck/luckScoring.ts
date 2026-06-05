import type { BaziAlgorithmResult } from "../bazi";
import { computeLocationLuckDelta } from "../location/regionElements";
import { pillarToString } from "../bazi/ganzhi";
import { getTenGod } from "../bazi/tenGods";
import {
  inferEvidencePolarity,
  stableEvidenceId,
  type EvidenceItem,
  type EvidenceSource,
} from "../rules/evidence";
import {
  buildHighlightsAndCautions,
  buildLuckScore,
  buildPeriodInsights,
  buildTransitSummary,
  scoreToLevel,
} from "./luckText";
import {
  formatDate,
  resolveLuckPeriodRange,
  getPeriodRange,
} from "./periodResolver";
import {
  calculateTransitContext,
  deterministicTransitHash,
  getMonthPillarForCalendarMonth,
  type TransitContext,
} from "./transitCalculator";
import type {
  LuckCategory,
  LuckOverview,
  LuckPeriod,
  LuckScore,
} from "./types";

const SCORE_MIN = 42;
const SCORE_MAX = 96;
const BASE_SCORE = 70;

type SubCategory = Exclude<LuckCategory, "overall">;

const SUB_CATEGORIES: SubCategory[] = [
  "love",
  "wealth",
  "career",
  "study",
  "social",
];

type ScoreBreakdown = LuckScore["scoreBreakdown"];

interface CategoryScoreResult {
  score: number;
  evidence: EvidenceItem[];
  scoreBreakdown: ScoreBreakdown;
}

export interface GenerateLuckOverviewInput {
  baziResult: BaziAlgorithmResult;
  targetDate?: Date;
  period: LuckPeriod;
  focusArea?: string;
  timelineOffset?: number;
}

export function clampScore(n: number): number {
  return Math.round(Math.max(SCORE_MIN, Math.min(SCORE_MAX, n)));
}

function roundImpact(n: number): number {
  return Number(n.toFixed(2));
}

function scoreEvidence(
  idPrefix: string,
  source: EvidenceSource,
  category: SubCategory | "overall",
  title: string,
  detail: string,
  weight = 1.5,
): EvidenceItem {
  return {
    id: stableEvidenceId(`luck-${idPrefix}`, `${category}:${title}:${detail}`),
    source,
    category,
    weight,
    polarity: inferEvidencePolarity(detail),
    title,
    detail,
  };
}

function breakdownSum(b: ScoreBreakdown): number {
  return (
    b.base +
    b.luckCycleImpact +
    b.yearImpact +
    b.monthImpact +
    b.dayImpact +
    b.usefulGodImpact +
    b.relationImpact +
    b.locationImpact +
    b.periodHashAdjustment
  );
}

function buildBreakdown(parts: Omit<ScoreBreakdown, "final">): ScoreBreakdown {
  const rounded: ScoreBreakdown = {
    base: parts.base,
    luckCycleImpact: roundImpact(parts.luckCycleImpact),
    yearImpact: roundImpact(parts.yearImpact),
    monthImpact: roundImpact(parts.monthImpact),
    dayImpact: roundImpact(parts.dayImpact),
    usefulGodImpact: roundImpact(parts.usefulGodImpact),
    relationImpact: roundImpact(parts.relationImpact),
    locationImpact: roundImpact(parts.locationImpact),
    periodHashAdjustment: roundImpact(parts.periodHashAdjustment),
    final: 0,
  };
  return { ...rounded, final: clampScore(breakdownSum(rounded)) };
}

function averageBreakdowns(
  items: Array<{ breakdown: ScoreBreakdown; weight: number }>,
): ScoreBreakdown {
  const total = items.reduce((sum, item) => sum + item.weight, 0) || 1;
  const pick = (key: keyof Omit<ScoreBreakdown, "final">) =>
    items.reduce((sum, item) => sum + item.breakdown[key] * item.weight, 0) / total;
  return buildBreakdown({
    base: pick("base"),
    luckCycleImpact: pick("luckCycleImpact"),
    yearImpact: pick("yearImpact"),
    monthImpact: pick("monthImpact"),
    dayImpact: pick("dayImpact"),
    usefulGodImpact: pick("usefulGodImpact"),
    relationImpact: pick("relationImpact"),
    locationImpact: pick("locationImpact"),
    periodHashAdjustment: pick("periodHashAdjustment"),
  });
}

function withFinalAdjustments(
  result: CategoryScoreResult,
  category: SubCategory,
  periodHashAdjustment: number,
  locationImpact: number,
): CategoryScoreResult {
  const scoreBreakdown = buildBreakdown({
    ...result.scoreBreakdown,
    periodHashAdjustment,
    locationImpact,
  });
  const evidence = [...result.evidence];
  if (periodHashAdjustment !== 0) {
    evidence.push(
      scoreEvidence(
        "period-hash",
        "score_model",
        category,
        "周期差异微调",
        `周期差异微调 ${periodHashAdjustment > 0 ? "+" : ""}${periodHashAdjustment}：基于周期、日期范围与流期干支确定生成`,
        1,
      ),
    );
  }
  if (locationImpact !== 0) {
    evidence.push(
      scoreEvidence(
        "location",
        "location",
        category,
        "地域辅助",
        `地域气候五行辅助调整 ${locationImpact > 0 ? "+" : ""}${locationImpact} 分`,
        1.2,
      ),
    );
  }
  return { score: scoreBreakdown.final, evidence, scoreBreakdown };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getCategoryWeights(focusArea?: string): Record<SubCategory, number> {
  const w: Record<SubCategory, number> = {
    love: 0.2,
    wealth: 0.2,
    career: 0.25,
    study: 0.2,
    social: 0.15,
  };
  const boostMap: Record<string, SubCategory> = {
    love: "love",
    wealth: "wealth",
    career: "career",
    study: "study",
  };
  const key = focusArea ? boostMap[focusArea] : undefined;
  if (!key) return w;

  const old = w[key];
  w[key] = 0.35;
  const remaining = 1 - 0.35;
  const othersSum = 1 - old;
  for (const k of SUB_CATEGORIES) {
    if (k !== key) w[k] = (w[k] / othersSum) * remaining;
  }
  return w;
}

function weekdayCategoryWeight(dayOfWeek: number, cat: SubCategory): number {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    if (cat === "love" || cat === "social") return 1.15;
    if (cat === "career" || cat === "study") return 0.9;
  } else {
    if (cat === "career" || cat === "study") return 1.1;
    if (cat === "love" || cat === "social") return 0.95;
  }
  return 1;
}

function scoreLayerFromTransit(
  bazi: BaziAlgorithmResult,
  transit: TransitContext,
  category: SubCategory,
  layer: "luck" | "year" | "month" | "day",
): number {
  let delta = 0;
  const dm = bazi.pillars.day.stem;
  const dmStrength = bazi.dayMasterStrength.strengthLevel;

  const pillar =
    layer === "year"
      ? transit.year
      : layer === "month"
        ? transit.month
        : layer === "day"
          ? transit.day
          : null;

  if (layer === "luck" && transit.currentLuckCycle) {
    const god = transit.currentLuckCycle.stemTenGod;
    delta += categorySignalFromTenGod(god, category, dmStrength, bazi);
    for (const r of transit.relations.luckRelations) {
      delta += relationDelta(r.type, category);
    }
    return delta;
  }

  if (!pillar) return 0;

  delta += categorySignalFromTenGod(pillar.stemTenGod, category, dmStrength, bazi);

  const rels =
    layer === "year"
      ? transit.relations.yearRelations
      : layer === "month"
        ? transit.relations.monthRelations
        : transit.relations.dayRelations;

  for (const r of rels) {
    delta += relationDelta(r.type, category, r.natal);
  }

  const useful = bazi.usefulGods?.usefulElementTendency ?? [];
  const avoid = bazi.usefulGods?.avoidElementTendency ?? [];
  if (useful.includes(pillar.stemElement)) delta += 3;
  if (avoid.includes(pillar.stemElement)) delta -= 3;

  return delta;
}

function categorySignalFromTenGod(
  god: string,
  category: SubCategory,
  dmStrength: string,
  bazi: BaziAlgorithmResult,
): number {
  let d = 0;
  const hasSeal =
    (bazi.tenGods.counts["正印"] ?? 0) + (bazi.tenGods.counts["偏印"] ?? 0) > 0;

  if (god === "正财" || god === "偏财") {
    if (category === "wealth") d += dmStrength === "weak" ? -4 : 5;
  }
  if (god === "正官" || god === "七杀") {
    if (category === "career") {
      d += hasSeal && dmStrength !== "weak" ? 5 : dmStrength === "weak" ? -4 : 3;
    }
  }
  if (god === "正印" || god === "偏印") {
    if (category === "study") d += 5;
    if (category === "social") d += 1;
  }
  if (god === "食神" || god === "伤官") {
    if (category === "social") d += 4;
    if (category === "study") d += 3;
    if (category === "love") d += 2;
  }
  if (god === "比肩" || god === "劫财") {
    if (category === "social") d += 2;
    if (category === "wealth") d -= 3;
  }
  return d;
}

function relationDelta(type: string, category: SubCategory, natal = ""): number {
  if (type === "六合") {
    if (category === "love") return 5;
    if (category === "social") return 3;
  }
  if (type === "冲") {
    if (category === "love") return -6;
    if (category === "social") return -3;
    if (natal.includes("月") && category === "career") return -5;
    if (natal.includes("月") && category === "study") return -3;
  }
  if (type === "害" && category === "social") return -2;
  if ((type === "三合" || type === "三会") && category === "social") return 2;
  return 0;
}

function scoreDayCategory(
  bazi: BaziAlgorithmResult,
  transit: TransitContext,
  category: SubCategory,
  focusArea?: string,
): CategoryScoreResult {
  const weights = { luck: 0.2, year: 0.25, month: 0.25, day: 0.3 };
  const luckCycleImpact =
    scoreLayerFromTransit(bazi, transit, category, "luck") * weights.luck;
  const yearImpact =
    scoreLayerFromTransit(bazi, transit, category, "year") * weights.year;
  const monthImpact =
    scoreLayerFromTransit(bazi, transit, category, "month") * weights.month;
  const dayImpact =
    scoreLayerFromTransit(bazi, transit, category, "day") * weights.day;
  const relationImpact =
    transit.categorySignals[category] * 0.35 + (focusArea === category ? 4 : 0);
  const usefulGodImpact =
    transit.usefulGodAlignment * 0.15 - transit.avoidGodPressure * 0.12;

  const scoreBreakdown = buildBreakdown({
    base: BASE_SCORE,
    luckCycleImpact,
    yearImpact,
    monthImpact,
    dayImpact,
    usefulGodImpact,
    relationImpact,
    locationImpact: 0,
    periodHashAdjustment: 0,
  });

  const evidence = [
    ...transit.evidence.slice(0, 4),
    scoreEvidence(
      `day-${category}`,
      "score_model",
      category,
      "日运分项信号",
      `流日${transit.day.pillar}对${category}类信号 ${transit.categorySignals[category] >= 0 ? "+" : ""}${Math.round(transit.categorySignals[category])}`,
      2,
    ),
  ];

  return { score: scoreBreakdown.final, evidence, scoreBreakdown };
}

function scoreWeekCategory(
  bazi: BaziAlgorithmResult,
  dates: Date[],
  category: SubCategory,
  focusArea?: string,
): CategoryScoreResult {
  let totalW = 0;
  let weighted = 0;
  const dailyScores: { date: Date; score: number; breakdown: ScoreBreakdown }[] = [];
  const tenGodCount: Record<string, number> = {};
  const elementCount: Record<string, number> = {};
  const relationCount: Record<string, number> = {};
  const breakdownItems: Array<{ breakdown: ScoreBreakdown; weight: number }> = [];
  const evidence: EvidenceItem[] = [];

  for (const d of dates) {
    const transit = calculateTransitContext(bazi, d);
    const { score, scoreBreakdown } = scoreDayCategory(bazi, transit, category, focusArea);
    const w = weekdayCategoryWeight(d.getDay(), category);
    weighted += score * w;
    totalW += w;
    dailyScores.push({ date: d, score, breakdown: scoreBreakdown });
    breakdownItems.push({ breakdown: scoreBreakdown, weight: w });
    tenGodCount[transit.day.stemTenGod] = (tenGodCount[transit.day.stemTenGod] ?? 0) + 1;
    elementCount[transit.day.stemElement] = (elementCount[transit.day.stemElement] ?? 0) + 1;
    for (const r of transit.relations.dayRelations) {
      relationCount[r.type] = (relationCount[r.type] ?? 0) + 1;
    }
  }

  const avg = weighted / totalW;
  dailyScores.sort((a, b) => b.score - a.score);
  const best = dailyScores[0];
  const worst = dailyScores[dailyScores.length - 1];

  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  evidence.push(
    scoreEvidence(
      `week-best-${category}`,
      "day_transit",
      category,
      "本周较强日期",
      `本周${weekdays[best.date.getDay()]}（${formatDate(best.date)}）${category}节奏相对突出`,
      2.2,
    ),
    scoreEvidence(
      `week-caution-${category}`,
      "day_transit",
      category,
      "本周需留意日期",
      `本周${weekdays[worst.date.getDay()]}（${formatDate(worst.date)}）宜保守、放慢节奏`,
      2,
    ),
  );

  const dominant = Object.entries(tenGodCount).sort((a, b) => b[1] - a[1])[0];
  if (dominant) {
    evidence.push(
      scoreEvidence(
        `week-god-${category}`,
        "ten_gods",
        category,
        "本周主导十神",
        `本周流日十神${dominant[0]}出现 ${dominant[1]} 次，主导本周${category}主题`,
        2,
      ),
    );
  }
  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0];
  if (dominantElement) {
    evidence.push(
      scoreEvidence(
        `week-element-${category}`,
        "five_elements",
        category,
        "本周主导五行",
        `本周流日五行${dominantElement[0]}出现 ${dominantElement[1]} 次`,
        1.8,
      ),
    );
  }
  const dominantRelation = Object.entries(relationCount).sort((a, b) => b[1] - a[1])[0];
  if (dominantRelation) {
    evidence.push(
      scoreEvidence(
        `week-relation-${category}`,
        "branch_relation",
        category,
        "本周常见关系",
        `本周流日与原局${dominantRelation[0]}关系出现 ${dominantRelation[1]} 次`,
        1.8,
      ),
    );
  }

  const weekTransit = calculateTransitContext(bazi, dates[3] ?? dates[0]);
  evidence.push(
    scoreEvidence(
      `week-anchor-${category}`,
      "month_transit",
      category,
      "本周中段流期",
      `本周中段流月${weekTransit.month.pillar}、流年${weekTransit.year.pillar}共同塑形`,
      1.8,
    ),
  );

  const scoreBreakdown = averageBreakdowns(breakdownItems);
  return { score: clampScore(avg), evidence, scoreBreakdown: { ...scoreBreakdown, final: clampScore(avg) } };
}

function scoreMonthCategory(
  bazi: BaziAlgorithmResult,
  range: ReturnType<typeof resolveLuckPeriodRange>,
  category: SubCategory,
  focusArea?: string,
): CategoryScoreResult {
  const anchorTransit = calculateTransitContext(bazi, range.anchorDate);
  const weights = { luck: 0.25, year: 0.3, month: 0.35, day: 0.1 };

  const luckCycleImpact =
    scoreLayerFromTransit(bazi, anchorTransit, category, "luck") * weights.luck;
  const yearImpact =
    scoreLayerFromTransit(bazi, anchorTransit, category, "year") * weights.year;
  const monthImpact =
    scoreLayerFromTransit(bazi, anchorTransit, category, "month") * weights.month;

  let daySum = 0;
  for (const d of range.dates) {
    const t = calculateTransitContext(bazi, d);
    daySum += scoreLayerFromTransit(bazi, t, category, "day");
  }
  const dayImpact = (daySum / range.dates.length) * weights.day;
  const relationImpact =
    anchorTransit.categorySignals[category] * 0.4 + (focusArea === category ? 4 : 0);
  const usefulGodImpact =
    anchorTransit.usefulGodAlignment * 0.1 - anchorTransit.avoidGodPressure * 0.08;

  const y = range.startDate.getFullYear();
  const m = range.startDate.getMonth() + 1;
  const monthPillar = getMonthPillarForCalendarMonth(y, m);
  const monthGod = getTenGod(bazi.pillars.day.stem, monthPillar.stem);

  const evidence: EvidenceItem[] = [
    scoreEvidence(
      `month-pillar-${category}`,
      "month_transit",
      category,
      "本月节气流月",
      `本月按节气月令取流月${pillarToString(monthPillar)}，${monthGod}主导全月节奏`,
      2.6,
    ),
    scoreEvidence(
      `month-year-luck-${category}`,
      "year_transit",
      category,
      "流年与大运",
      `本月与流年${anchorTransit.year.pillar}、大运${anchorTransit.currentLuckCycle ? pillarToString(anchorTransit.currentLuckCycle.pillar) : "—"}共同作用`,
      2,
    ),
    ...anchorTransit.relations.monthRelations.slice(0, 2).map((r) =>
      scoreEvidence(
        `month-relation-${category}-${r.type}`,
        "branch_relation",
        category,
        r.type,
        r.description,
        1.8,
      ),
    ),
    scoreEvidence(
      `month-samples-${category}`,
      "day_transit",
      category,
      "月内抽样",
      `月初至月末抽样 ${range.dates.length} 个节点校准流日波动`,
      1.6,
    ),
  ];

  const scoreBreakdown = buildBreakdown({
    base: BASE_SCORE,
    luckCycleImpact,
    yearImpact,
    monthImpact,
    dayImpact,
    usefulGodImpact,
    relationImpact,
    locationImpact: 0,
    periodHashAdjustment: 0,
  });

  return { score: scoreBreakdown.final, evidence, scoreBreakdown };
}

function scoreYearCategory(
  bazi: BaziAlgorithmResult,
  range: ReturnType<typeof resolveLuckPeriodRange>,
  category: SubCategory,
  focusArea?: string,
): CategoryScoreResult {
  const y = range.startDate.getFullYear();
  const anchorTransit = calculateTransitContext(bazi, range.anchorDate);
  const weights = { luck: 0.35, year: 0.4, month: 0.25 };

  const luckCycleImpact =
    scoreLayerFromTransit(bazi, anchorTransit, category, "luck") * weights.luck;
  const yearImpact =
    scoreLayerFromTransit(bazi, anchorTransit, category, "year") * weights.year;

  let monthDelta = 0;
  const monthScores: { month: number; pillar: string; delta: number }[] = [];
  for (let mi = 1; mi <= 12; mi++) {
    const mp = getMonthPillarForCalendarMonth(y, mi);
    const god = getTenGod(bazi.pillars.day.stem, mp.stem);
    const d = categorySignalFromTenGod(
      god,
      category,
      bazi.dayMasterStrength.strengthLevel,
      bazi,
    );
    monthDelta += d;
    monthScores.push({ month: mi, pillar: pillarToString(mp), delta: d });
  }
  const monthImpact = (monthDelta / 12) * weights.month;
  const relationImpact =
    anchorTransit.categorySignals[category] * 0.3 + (focusArea === category ? 4 : 0);
  const usefulGodImpact =
    anchorTransit.usefulGodAlignment * 0.1 - anchorTransit.avoidGodPressure * 0.08;

  monthScores.sort((a, b) => b.delta - a.delta);
  const strong = monthScores.slice(0, 2);
  const weak = monthScores.slice(-2);

  const evidence: EvidenceItem[] = [
    scoreEvidence(
      `year-pillar-${category}`,
      "year_transit",
      category,
      "目标流年",
      `${y}年流年${anchorTransit.year.pillar}，${anchorTransit.year.stemTenGod}为全年主轴`,
      2.8,
    ),
    scoreEvidence(
      `year-luck-${category}`,
      "luck_cycle",
      category,
      "年度大运背景",
      anchorTransit.currentLuckCycle
        ? `与大运${pillarToString(anchorTransit.currentLuckCycle.pillar)}（${anchorTransit.currentLuckCycle.stemTenGod}）形成年度背景`
        : "大运数据有限，以流年与原局为主",
      2.2,
    ),
    scoreEvidence(
      `year-strong-months-${category}`,
      "month_transit",
      category,
      "较顺月份",
      `较顺月份：${strong.map((s) => `${s.month}月${s.pillar}`).join("、")}`,
      2,
    ),
    scoreEvidence(
      `year-weak-months-${category}`,
      "month_transit",
      category,
      "需留意月份",
      `需留意月份：${weak.map((s) => `${s.month}月${s.pillar}`).join("、")}`,
      2,
    ),
    ...anchorTransit.relations.yearRelations.slice(0, 1).map((r) =>
      scoreEvidence(
        `year-relation-${category}-${r.type}`,
        "branch_relation",
        category,
        r.type,
        r.description,
        1.8,
      ),
    ),
  ];

  const scoreBreakdown = buildBreakdown({
    base: BASE_SCORE,
    luckCycleImpact,
    yearImpact,
    monthImpact,
    dayImpact: 0,
    usefulGodImpact,
    relationImpact,
    locationImpact: 0,
    periodHashAdjustment: 0,
  });

  return { score: scoreBreakdown.final, evidence, scoreBreakdown };
}

function computeCategoryForPeriod(
  bazi: BaziAlgorithmResult,
  range: ReturnType<typeof resolveLuckPeriodRange>,
  category: SubCategory,
  focusArea?: string,
): CategoryScoreResult {
  switch (range.period) {
    case "day": {
      const transit = calculateTransitContext(bazi, range.anchorDate);
      return scoreDayCategory(bazi, transit, category, focusArea);
    }
    case "week":
      return scoreWeekCategory(bazi, range.dates, category, focusArea);
    case "month":
      return scoreMonthCategory(bazi, range, category, focusArea);
    case "year":
      return scoreYearCategory(bazi, range, category, focusArea);
  }
}

function applyDeterministicAdjustment(
  period: LuckPeriod,
  range: ReturnType<typeof resolveLuckPeriodRange>,
  anchorTransit: TransitContext,
): { adjustment: number; basisNote?: string } {
  const pillarKey = `${anchorTransit.year.pillar}|${anchorTransit.month.pillar}|${anchorTransit.day.pillar}`;
  const hash = deterministicTransitHash(
    period,
    formatDate(range.startDate),
    formatDate(range.endDate),
    pillarKey,
  );
  if (hash === 0) return { adjustment: 0 };
  return {
    adjustment: hash,
    basisNote: `周期差异微调：基于流期干支哈希，修正 ${hash > 0 ? "+" : ""}${hash}`,
  };
}

function buildCalculationBasis(
  bazi: BaziAlgorithmResult,
  range: ReturnType<typeof resolveLuckPeriodRange>,
  transit: TransitContext,
): string[] {
  const basis: string[] = [
    `周期：${range.period}（${range.label}）`,
    "基于本命四柱、五行、十神、合冲刑害、神煞与流期干支",
    `流年 ${transit.year.pillar}（${transit.year.stemTenGod}）`,
    `流月 ${transit.month.pillar}（${transit.month.stemTenGod}，按节气月令切换）`,
  ];

  if (range.period === "day") {
    basis.push(`流日 ${transit.day.pillar}（${transit.day.stemTenGod}）`);
  } else if (range.period === "week") {
    basis.push(`聚合本周 ${range.dates.length} 天流日加权平均`);
  } else if (range.period === "month") {
    basis.push(`以节气流月为主导，抽样 ${range.dates.length} 个流日节点`);
  } else {
    basis.push("以流年为主导，结合当前大运与12个月节气流月趋势");
  }

  if (transit.currentLuckCycle) {
    basis.push(
      `当前大运 ${pillarToString(transit.currentLuckCycle.pillar)}（${transit.currentLuckCycle.stemTenGod}）`,
    );
  }

  if (bazi.usefulGods) {
    basis.push(`喜用 ${bazi.usefulGods.usefulElementTendency.join("、")}`);
  }

  return basis;
}

function buildDebugHash(
  period: LuckPeriod,
  range: ReturnType<typeof resolveLuckPeriodRange>,
  transit: TransitContext,
  scores: Record<SubCategory, number>,
): string {
  const payload = [
    period,
    formatDate(range.startDate),
    formatDate(range.endDate),
    transit.year.pillar,
    transit.month.pillar,
    transit.day.pillar,
    ...SUB_CATEGORIES.map((c) => scores[c]),
  ].join("|");
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = Math.imul(31, h) + payload.charCodeAt(i);
    h |= 0;
  }
  return `lk${(h >>> 0).toString(16)}`;
}

export function generateLuckOverview(
  input: GenerateLuckOverviewInput,
): LuckOverview {
  const targetDate = startOfDay(input.targetDate ?? new Date());
  const offset = input.timelineOffset ?? 0;
  const focusArea = input.focusArea ?? "overall";
  const range = resolveLuckPeriodRange(targetDate, input.period, offset);
  const { baziResult } = input;
  const anchorTransit = calculateTransitContext(baziResult, range.anchorDate);

  const raw: Record<SubCategory, CategoryScoreResult> =
    {} as Record<SubCategory, CategoryScoreResult>;

  for (const cat of SUB_CATEGORIES) {
    raw[cat] = computeCategoryForPeriod(baziResult, range, cat, focusArea);
  }

  const { adjustment: periodHashAdjustment, basisNote } = applyDeterministicAdjustment(
    input.period,
    range,
    anchorTransit,
  );

  const locationNotes: string[] = [];
  let locationImpact = 0;
  const locBias = baziResult.locationInfluence?.resolved.elementBias;
  if (
    locBias &&
    baziResult.locationInfluence?.resolved.locationConfidence !== "unknown"
  ) {
    const useful = baziResult.usefulGods?.usefulElementTendency ?? [];
    const avoid = baziResult.usefulGods?.avoidElementTendency ?? [];
    const delta = computeLocationLuckDelta(locBias, useful, avoid);
    if (delta !== 0) {
      locationImpact = delta;
      locationNotes.push(
        `地域气候五行辅助调整 ${delta > 0 ? "+" : ""}${delta} 分（上限±3）`,
      );
    }
  }

  const adjustedRaw: Record<SubCategory, CategoryScoreResult> =
    {} as Record<SubCategory, CategoryScoreResult>;
  for (const cat of SUB_CATEGORIES) {
    adjustedRaw[cat] = withFinalAdjustments(
      raw[cat],
      cat,
      periodHashAdjustment,
      locationImpact,
    );
  }

  const subScoreNums = Object.fromEntries(
    SUB_CATEGORIES.map((c) => [c, adjustedRaw[c].score]),
  ) as Record<SubCategory, number>;

  const weights = getCategoryWeights(focusArea);
  let overallScore = 0;
  for (const cat of SUB_CATEGORIES) {
    overallScore += subScoreNums[cat] * weights[cat];
  }
  overallScore = clampScore(overallScore);

  const scores: LuckScore[] = SUB_CATEGORIES.map((cat) =>
    buildLuckScore({
      category: cat,
      score: subScoreNums[cat],
      evidence: adjustedRaw[cat].evidence,
      scoreBreakdown: adjustedRaw[cat].scoreBreakdown,
      focusArea,
      period: input.period,
      dateLabel: range.label,
      startDate: formatDate(range.startDate),
      endDate: formatDate(range.endDate),
      transit: anchorTransit,
    }),
  );

  const { highlights, cautions } = buildHighlightsAndCautions(scores);
  const transitSummary = buildTransitSummary(anchorTransit, range);
  const periodInsights = buildPeriodInsights(
    input.period,
    range,
    scores,
    anchorTransit,
  );

  const calculationBasis = [
    ...buildCalculationBasis(baziResult, range, anchorTransit),
    ...(basisNote ? [basisNote] : []),
    ...locationNotes,
  ];

  return {
    period: input.period,
    dateLabel: range.label,
    startDate: formatDate(range.startDate),
    endDate: formatDate(range.endDate),
    overallScore,
    overallLevel: scoreToLevel(overallScore),
    scores,
    highlights,
    cautions,
    calculationBasis,
    transitSummary,
    periodInsights,
    debugHash: buildDebugHash(input.period, range, anchorTransit, subScoreNums),
  };
}

export function generateAllLuckOverviews(
  baziResult: BaziAlgorithmResult,
  focusArea?: string,
  targetDate?: Date,
): Record<LuckPeriod, LuckOverview> {
  const date = targetDate ?? new Date();
  return {
    day: generateLuckOverview({ baziResult, targetDate: date, period: "day", focusArea }),
    week: generateLuckOverview({ baziResult, targetDate: date, period: "week", focusArea }),
    month: generateLuckOverview({ baziResult, targetDate: date, period: "month", focusArea }),
    year: generateLuckOverview({ baziResult, targetDate: date, period: "year", focusArea }),
  };
}

export { getPeriodRange };
