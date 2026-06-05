import type { BaziAlgorithmResult } from "../bazi";
import { computeLocationLuckDelta } from "../location/regionElements";
import { analyzeBranchRelations } from "../bazi/branchRelations";
import {
  ELEMENT_GENERATES,
  STEM_ELEMENT,
  type EarthlyBranch,
  type FiveElement,
} from "../bazi/constants";
import {
  getDayPillarIndex,
  getSexagenary,
  getYearPillarIndex,
  pillarToString,
  type Pillar,
} from "../bazi/ganzhi";
import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  MONTH_BRANCHES,
  YEAR_STEM_TO_YIN_MONTH_STEM,
} from "../bazi/constants";
import { advanceStem } from "../bazi/ganzhi";
import { getTenGod, type TenGod } from "../bazi/tenGods";
import type { FourPillars } from "../bazi/pillars";
import {
  buildHighlightsAndCautions,
  buildLuckScore,
  scoreToLevel,
} from "./luckText";
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

export interface GenerateLuckOverviewInput {
  baziResult: BaziAlgorithmResult;
  targetDate?: Date;
  period: LuckPeriod;
  focusArea?: string;
  /** 时间轴偏移：日=±天，周=±周，月=±月，年=±年 */
  timelineOffset?: number;
}

interface FlowContext {
  period: LuckPeriod;
  startDate: Date;
  endDate: Date;
  dayPillars: Pillar[];
  monthPillar?: Pillar;
  yearPillar?: Pillar;
  yearStemTenGod?: TenGod;
  dayStemTenGods: TenGod[];
}

function clampScore(n: number): number {
  return Math.round(Math.max(SCORE_MIN, Math.min(SCORE_MAX, n)));
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(d: Date): string {
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${weekdays[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return startOfDay(r);
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return r;
}

function getMonthRange(date: Date, offsetMonths = 0): { start: Date; end: Date } {
  const d = addMonths(date, offsetMonths);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: startOfDay(start), end: startOfDay(end) };
}

function getWeekRange(date: Date, offsetWeeks = 0): { start: Date; end: Date } {
  const d = addDays(date, offsetWeeks * 7);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = addDays(d, mondayOffset);
  const end = addDays(start, 6);
  return { start, end };
}

function getYearRange(date: Date, offsetYears = 0): { start: Date; end: Date } {
  const y = date.getFullYear() + offsetYears;
  return {
    start: new Date(y, 0, 1),
    end: new Date(y, 11, 31),
  };
}

function getPeriodRange(
  period: LuckPeriod,
  targetDate: Date,
  offset = 0,
): { start: Date; end: Date } {
  switch (period) {
    case "day":
      return { start: addDays(targetDate, offset), end: addDays(targetDate, offset) };
    case "week":
      return getWeekRange(targetDate, offset);
    case "month":
      return getMonthRange(targetDate, offset);
    case "year":
      return getYearRange(targetDate, offset);
  }
}

function getDayPillarForDate(date: Date): Pillar {
  return getSexagenary(
    getDayPillarIndex(date.getFullYear(), date.getMonth() + 1, date.getDate()),
  );
}

function getMonthPillar(year: number, month: number): Pillar {
  const yearStem = getSexagenary(getYearPillarIndex(year)).stem;
  const yinStem = YEAR_STEM_TO_YIN_MONTH_STEM[yearStem];
  const stem = advanceStem(yinStem, month - 1);
  const branch = MONTH_BRANCHES[month - 1];
  const stemIdx = HEAVENLY_STEMS.indexOf(stem);
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      return { stem, branch, index: i };
    }
  }
  return { stem, branch, index: 0 };
}

function enumerateDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

function buildFlowContext(
  period: LuckPeriod,
  start: Date,
  end: Date,
): FlowContext {
  const days = enumerateDays(start, end);
  const dayPillars = days.map(getDayPillarForDate);
  const refYear = start.getFullYear();
  const refMonth = start.getMonth() + 1;

  const monthPillar = getMonthPillar(refYear, refMonth);
  const yearPillar = getSexagenary(getYearPillarIndex(refYear));

  return {
    period,
    startDate: start,
    endDate: end,
    dayPillars,
    monthPillar,
    yearPillar,
    yearStemTenGod: undefined,
    dayStemTenGods: [],
  };
}

function branchesClash(a: EarthlyBranch, b: EarthlyBranch): boolean {
  const pairs: Array<[EarthlyBranch, EarthlyBranch]> = [
    ["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"],
  ];
  return pairs.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

function branchesCombine(a: EarthlyBranch, b: EarthlyBranch): boolean {
  const pairs: Array<[EarthlyBranch, EarthlyBranch]> = [
    ["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"],
  ];
  return pairs.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

function elementSupports(helper: FiveElement, target: FiveElement): boolean {
  return helper === target || ELEMENT_GENERATES[helper] === target;
}

function findStar(bazi: BaziAlgorithmResult, name: string): boolean {
  return bazi.symbolicStars.some((s) => s.name === name && s.found);
}

function getCategoryWeights(focusArea?: string): Record<SubCategory, number> {
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
  for (const k of Object.keys(w) as SubCategory[]) {
    if (k !== key) w[k] = (w[k] / othersSum) * remaining;
  }
  return w;
}

function scoreLove(bazi: BaziAlgorithmResult, flow: FlowContext, focusArea?: string): {
  score: number;
  evidence: string[];
} {
  let score = BASE_SCORE;
  const evidence: string[] = [];
  const dm = bazi.pillars.day.stem;
  const dayBranch = bazi.pillars.day.branch;
  const tg = bazi.tenGods.counts;

  if (findStar(bazi, "桃花") || findStar(bazi, "红鸾") || findStar(bazi, "天喜")) {
    score += 5;
    evidence.push("命局带桃花或喜庆标签，人缘与表达感较活跃");
  }
  if (findStar(bazi, "咸池")) {
    score += 3;
    evidence.push("咸池主魅力与人缘，情感互动更容易被看见");
  }

  for (const pillar of flow.dayPillars) {
    if (branchesCombine(pillar.branch, dayBranch)) {
      score += 5;
      evidence.push(`流日地支${pillar.branch}与日支${dayBranch}相合，关系沟通感较顺`);
    }
    if (branchesClash(pillar.branch, dayBranch)) {
      score -= 7;
      evidence.push(`流日地支${pillar.branch}冲日支${dayBranch}，情绪敏感点需留意`);
    }
    const tenGod = getTenGod(dm, pillar.stem);
    if (tenGod === "正财" || tenGod === "偏财") score += 3;
    if (tenGod === "正官" || tenGod === "七杀") score += 2;
  }

  if ((tg["伤官"] ?? 0) > 2) {
    score -= 5;
    evidence.push("伤官偏强，表达可能较直接，宜注意语气");
  }
  if ((tg["比肩"] ?? 0) + (tg["劫财"] ?? 0) > 3) {
    score -= 4;
    evidence.push("比劫偏旺，自我感较强，关系中宜多倾听");
  }

  const ug = bazi.usefulGods;
  if (ug && flow.monthPillar) {
    const monthEl = STEM_ELEMENT[flow.monthPillar.stem];
    if (ug.usefulElementTendency.includes(monthEl)) {
      score += 6;
      evidence.push(`流月五行${monthEl}与喜用倾向一致，感情节奏更和谐`);
    }
  }

  if (focusArea === "love") score += 4;

  return { score: clampScore(score), evidence };
}

function scoreWealth(bazi: BaziAlgorithmResult, flow: FlowContext, focusArea?: string): {
  score: number;
  evidence: string[];
} {
  let score = BASE_SCORE;
  const evidence: string[] = [];
  const dm = bazi.pillars.day.stem;
  const dmStrength = bazi.dayMasterStrength.strengthLevel;
  const tg = bazi.tenGods.counts;

  const wealthGods = (tg["正财"] ?? 0) + (tg["偏财"] ?? 0);
  const outputGods = (tg["食神"] ?? 0) + (tg["伤官"] ?? 0);

  if (wealthGods > 0 && outputGods > 0) {
    score += 6;
    evidence.push("食伤生财结构存在，资源流动有生成链条");
  }
  if (wealthGods > 2 && dmStrength === "weak") {
    score -= 6;
    evidence.push("财星偏旺而日主偏弱，担财压力需留意");
  }
  if ((tg["比肩"] ?? 0) + (tg["劫财"] ?? 0) > 2.5) {
    score -= 5;
    evidence.push("比劫偏旺，开支竞争感可能增强");
  }

  for (const pillar of flow.dayPillars) {
    const tenGod = getTenGod(dm, pillar.stem);
    if (tenGod === "正财" || tenGod === "偏财") {
      score += 4;
      evidence.push(`流日十神${tenGod}，财务主题容易被触发`);
    }
  }

  if (flow.monthPillar) {
    const mGod = getTenGod(dm, flow.monthPillar.stem);
    if (mGod === "正财" || mGod === "偏财") {
      score += 5;
      evidence.push(`流月十神${mGod}，适合整理账目与规划`);
    }
  }

  if (findStar(bazi, "禄神")) {
    score += 3;
    evidence.push("禄神有助稳定资源感");
  }

  if (focusArea === "wealth") score += 4;

  return { score: clampScore(score), evidence };
}

function scoreCareer(bazi: BaziAlgorithmResult, flow: FlowContext, focusArea?: string): {
  score: number;
  evidence: string[];
} {
  let score = BASE_SCORE;
  const evidence: string[] = [];
  const dm = bazi.pillars.day.stem;
  const tg = bazi.tenGods.counts;
  const monthBranch = bazi.pillars.month.branch;

  const officer = (tg["正官"] ?? 0) + (tg["七杀"] ?? 0);
  const seal = (tg["正印"] ?? 0) + (tg["偏印"] ?? 0);

  if (officer > 0 && seal > 0) {
    score += 7;
    evidence.push("官印相生倾向，工作推进有支撑");
  }
  if ((tg["伤官"] ?? 0) > 1.5 && officer > 1) {
    score -= 6;
    evidence.push("伤官见官压力，沟通方式宜圆融");
  }
  if (officer > 2.5) {
    score -= 4;
    evidence.push("官杀偏旺，职场节奏可能偏紧");
  }

  for (const pillar of flow.dayPillars) {
    if (branchesClash(pillar.branch, monthBranch)) {
      score -= 6;
      evidence.push(`流日冲月支${monthBranch}，事业环境可能有波动感`);
    }
    const tenGod = getTenGod(dm, pillar.stem);
    if (tenGod === "正官" || tenGod === "七杀") score += 3;
  }

  if (flow.yearPillar) {
    const yGod = getTenGod(dm, flow.yearPillar.stem);
    if (yGod === "正官" || yGod === "七杀") {
      score += 4;
      evidence.push(`流年十神${yGod}，职业主题被引动`);
    }
  }

  const lc = bazi.luckCycle;
  if (lc?.cycles.length && flow.yearPillar) {
    const yr = flow.startDate.getFullYear();
    const current = lc.cycles.find((c) => yr >= c.startYear && yr < c.endYear);
    if (current && (current.stemTenGod === "正官" || current.stemTenGod === "正印")) {
      score += 5;
      evidence.push(`当前大运${pillarToString(current.pillar)}利事业推进`);
    }
  }

  if (focusArea === "career") score += 4;

  return { score: clampScore(score), evidence };
}

function scoreStudy(bazi: BaziAlgorithmResult, flow: FlowContext, focusArea?: string): {
  score: number;
  evidence: string[];
} {
  let score = BASE_SCORE;
  const evidence: string[] = [];
  const dm = bazi.pillars.day.stem;
  const tg = bazi.tenGods.counts;

  const seal = (tg["正印"] ?? 0) + (tg["偏印"] ?? 0);
  const output = (tg["食神"] ?? 0) + (tg["伤官"] ?? 0);

  if (seal > 1) {
    score += 6;
    evidence.push("印星有力，利吸收与记忆");
  }
  if (findStar(bazi, "文昌贵人")) {
    score += 5;
    evidence.push("文昌贵人触发，学习输出感较佳");
  }
  if (output > 2.5) {
    score -= 5;
    evidence.push("食伤过旺，注意力可能易分散");
  }
  if ((tg["正财"] ?? 0) + (tg["偏财"] ?? 0) > 2) {
    score -= 3;
    evidence.push("财星偏旺，现实事务可能干扰专注");
  }

  const dmEl = bazi.dayMasterStrength.dayMasterElement;
  if (dmEl === "木" || dmEl === "火") {
    score += 3;
    evidence.push("木火通明倾向，利理解与创新");
  }

  for (const pillar of flow.dayPillars) {
    const tenGod = getTenGod(dm, pillar.stem);
    if (tenGod === "正印" || tenGod === "偏印") score += 4;
    const el = STEM_ELEMENT[pillar.stem];
    if (elementSupports(el, dmEl)) score += 2;
  }

  if (focusArea === "study") score += 6;

  return { score: clampScore(score), evidence };
}

function scoreSocial(bazi: BaziAlgorithmResult, flow: FlowContext, focusArea?: string): {
  score: number;
  evidence: string[];
} {
  let score = BASE_SCORE;
  const evidence: string[] = [];
  const dm = bazi.pillars.day.stem;
  const tg = bazi.tenGods.counts;
  const br = bazi.branchRelations;

  if (br.combinations.length || br.meetings.length) {
    score += 5;
    evidence.push("命局合局较好，人际互动有协调基础");
  }
  if (br.clashes.length || br.harms.length) {
    score -= 4;
    evidence.push("命局冲害存在，社交中宜留余地");
  }

  const output = (tg["食神"] ?? 0) + (tg["伤官"] ?? 0);
  if (output > 0.5 && output < 3) {
    score += 5;
    evidence.push("食伤适度，表达与倾听较平衡");
  }
  if ((tg["伤官"] ?? 0) > 2) {
    score -= 5;
    evidence.push("伤官偏强，言辞可能偏锋利");
  }
  if ((tg["比肩"] ?? 0) + (tg["劫财"] ?? 0) > 3) {
    score -= 5;
    evidence.push("比劫偏旺，合作中竞争感可能增强");
  }

  if (findStar(bazi, "桃花")) {
    score += 4;
    evidence.push("桃花助人缘，适合主动联络");
  }

  for (const pillar of flow.dayPillars) {
    const virtual: FourPillars = {
      year: bazi.pillars.year,
      month: bazi.pillars.month,
      day: bazi.pillars.day,
      hour: pillar,
    };
    const rel = analyzeBranchRelations(virtual);
    if (rel.analysis.combinations.length) score += 2;
    if (rel.analysis.clashes.length) score -= 3;
  }

  if (focusArea === "health") {
    evidence.push("健康关注下，综合分与人际保持正常权重，不作医疗预测");
  }

  return { score: clampScore(score), evidence };
}

const CATEGORY_SCORERS: Record<
  SubCategory,
  (b: BaziAlgorithmResult, f: FlowContext, focus?: string) => { score: number; evidence: string[] }
> = {
  love: scoreLove,
  wealth: scoreWealth,
  career: scoreCareer,
  study: scoreStudy,
  social: scoreSocial,
};

function scoreWeekCategory(
  bazi: BaziAlgorithmResult,
  start: Date,
  end: Date,
  category: SubCategory,
  focusArea?: string,
): { score: number; evidence: string[] } {
  const days = enumerateDays(start, end);
  const dailyScores: number[] = [];
  const evidence: string[] = [];

  for (const day of days) {
    const flow = buildFlowContext("day", day, day);
    const result = CATEGORY_SCORERS[category](bazi, flow, focusArea);
    dailyScores.push(result.score);
    if (result.evidence.length) evidence.push(...result.evidence.slice(0, 1));
  }

  const avg = dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length;
  const bestIdx = dailyScores.indexOf(Math.max(...dailyScores));
  const worstIdx = dailyScores.indexOf(Math.min(...dailyScores));
  evidence.push(
    `本周${formatDateLabel(days[bestIdx])}相对突出`,
    `本周${formatDateLabel(days[worstIdx])}宜放慢节奏`,
  );

  return { score: clampScore(avg), evidence: [...new Set(evidence)].slice(0, 5) };
}

function computeSubScores(
  bazi: BaziAlgorithmResult,
  flow: FlowContext,
  focusArea?: string,
): Record<SubCategory, { score: number; evidence: string[] }> {
  const result = {} as Record<SubCategory, { score: number; evidence: string[] }>;

  if (flow.period === "week") {
    for (const cat of Object.keys(CATEGORY_SCORERS) as SubCategory[]) {
      result[cat] = scoreWeekCategory(
        bazi,
        flow.startDate,
        flow.endDate,
        cat,
        focusArea,
      );
    }
    return result;
  }

  for (const cat of Object.keys(CATEGORY_SCORERS) as SubCategory[]) {
    result[cat] = CATEGORY_SCORERS[cat](bazi, flow, focusArea);
  }
  return result;
}

function computeOverallScore(
  subScores: Record<SubCategory, number>,
  focusArea?: string,
): number {
  const weights = getCategoryWeights(focusArea);
  let total = 0;
  for (const cat of Object.keys(weights) as SubCategory[]) {
    total += subScores[cat] * weights[cat];
  }
  return clampScore(total);
}

function buildDateLabel(
  period: LuckPeriod,
  start: Date,
  end: Date,
  offset: number,
): string {
  const today = startOfDay(new Date());
  if (period === "day") {
    if (formatDate(start) === formatDate(today)) return "今天";
    return formatDateLabel(start);
  }
  if (period === "week") {
    if (offset === 0) return "本周";
    if (offset === -1) return "上周";
    if (offset === 1) return "下周";
    return `${formatDate(start).slice(5)}-${formatDate(end).slice(5)}`;
  }
  if (period === "month") {
    if (offset === 0) return "本月";
    if (offset === -1) return "上月";
    if (offset === 1) return "下月";
    return `${start.getFullYear()}年${start.getMonth() + 1}月`;
  }
  if (offset === 0) return "今年";
  if (offset === -1) return "去年";
  if (offset === 1) return "明年";
  return `${start.getFullYear()}年`;
}

function buildCalculationBasis(
  bazi: BaziAlgorithmResult,
  flow: FlowContext,
): string[] {
  const basis: string[] = [
    "基于本命四柱、五行、十神、合冲刑害与神煞标签",
  ];

  if (flow.dayPillars.length === 1) {
    basis.push(`流日干支 ${pillarToString(flow.dayPillars[0])}`);
  } else if (flow.dayPillars.length > 1) {
    basis.push(`综合 ${flow.dayPillars.length} 天流日平均`);
  }

  if (flow.monthPillar) {
    basis.push(`流月干支 ${pillarToString(flow.monthPillar)}`);
  }
  if (flow.yearPillar) {
    basis.push(`流年干支 ${pillarToString(flow.yearPillar)}`);
  }

  if (bazi.luckCycle?.cycles.length) {
    basis.push("结合当前大运周期");
  } else {
    basis.push("大运数据有限，使用基础评分模型");
  }

  if (bazi.usefulGods) {
    basis.push(
      `喜用倾向 ${bazi.usefulGods.usefulElementTendency.join("、")}`,
    );
  }

  return basis;
}

export function generateLuckOverview(
  input: GenerateLuckOverviewInput,
): LuckOverview {
  const targetDate = startOfDay(input.targetDate ?? new Date());
  const offset = input.timelineOffset ?? 0;
  const focusArea = input.focusArea ?? "overall";
  const { start, end } = getPeriodRange(input.period, targetDate, offset);
  const flow = buildFlowContext(input.period, start, end);

  if (flow.yearPillar && input.baziResult.pillars.day.stem) {
    flow.yearStemTenGod = getTenGod(
      input.baziResult.pillars.day.stem,
      flow.yearPillar.stem,
    );
  }

  const raw = computeSubScores(input.baziResult, flow, focusArea);
  const subScoreNums = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v.score]),
  ) as Record<SubCategory, number>;

  let overallScore = computeOverallScore(subScoreNums, focusArea);
  const locationNotes: string[] = [];

  const locBias = input.baziResult.locationInfluence?.resolved.elementBias;
  if (locBias && input.baziResult.locationInfluence?.resolved.locationConfidence !== "unknown") {
    const useful = input.baziResult.usefulGods?.usefulElementTendency ?? [];
    const avoid = input.baziResult.usefulGods?.avoidElementTendency ?? [];
    const delta = computeLocationLuckDelta(locBias, useful, avoid);
    if (delta !== 0) {
      overallScore = clampScore(overallScore + delta);
      locationNotes.push(
        `地域气候五行辅助调整 ${delta > 0 ? "+" : ""}${delta} 分（上限±3，不替代命局判断）`,
      );
    }
  }

  const scores: LuckScore[] = (Object.keys(raw) as SubCategory[]).map((cat) =>
    buildLuckScore(cat, raw[cat].score, raw[cat].evidence, focusArea),
  );

  const { highlights, cautions } = buildHighlightsAndCautions(scores);

  return {
    period: input.period,
    dateLabel: buildDateLabel(input.period, start, end, offset),
    startDate: formatDate(start),
    endDate: formatDate(end),
    overallScore,
    overallLevel: scoreToLevel(overallScore),
    scores,
    highlights,
    cautions,
    calculationBasis: [
      ...buildCalculationBasis(input.baziResult, flow),
      ...locationNotes,
    ],
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

export { getCategoryWeights, clampScore, getPeriodRange };
