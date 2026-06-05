import { DateTime } from "luxon";
import type { BaziAlgorithmResult } from "../bazi";
import { analyzeBranchRelations } from "../bazi/branchRelations";
import { BRANCH_HIDDEN_STEMS } from "../bazi/hiddenStems";
import {
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
import type { LuckCycleEntry } from "../bazi/luckCycle";
import { getMonthPillar, getYearPillar } from "../bazi/pillars";
import { getTenGod, type TenGod } from "../bazi/tenGods";
import { formatDate } from "./periodResolver";
import type { LuckCategory } from "./types";

const TIMEZONE = "Asia/Shanghai";
type SubCategory = Exclude<LuckCategory, "overall">;

export interface TransitPillar {
  type: "year" | "month" | "day" | "luck";
  date: string;
  pillar: string;
  stem: string;
  branch: EarthlyBranch;
  stemElement: FiveElement;
  branchElement: FiveElement;
  stemTenGod: TenGod;
  branchTenGods: string[];
}

export interface TransitRelation {
  type: string;
  transit: string;
  natal: string;
  description: string;
}

export interface TransitContext {
  date: Date;
  year: TransitPillar;
  month: TransitPillar;
  day: TransitPillar;
  currentLuckCycle?: LuckCycleEntry;
  relations: {
    yearRelations: TransitRelation[];
    monthRelations: TransitRelation[];
    dayRelations: TransitRelation[];
    luckRelations: TransitRelation[];
  };
  elementImpact: Record<FiveElement, number>;
  usefulGodAlignment: number;
  avoidGodPressure: number;
  categorySignals: Record<SubCategory, number>;
  evidence: string[];
}

const BRANCH_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const LIU_HE: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "丑"], ["寅", "亥"], ["卯", "戌"], ["辰", "酉"], ["巳", "申"], ["午", "未"],
];

const LIU_CHONG: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"],
];

const LIU_HAI: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "未"], ["丑", "午"], ["寅", "巳"], ["卯", "辰"], ["申", "亥"], ["酉", "戌"],
];

function branchesPair(
  a: EarthlyBranch,
  b: EarthlyBranch,
  pairs: Array<[EarthlyBranch, EarthlyBranch]>,
): boolean {
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function getDayPillarForDate(date: Date): Pillar {
  return getSexagenary(
    getDayPillarIndex(date.getFullYear(), date.getMonth() + 1, date.getDate()),
  );
}

function getLuckCycleAtYear(
  bazi: BaziAlgorithmResult,
  year: number,
): LuckCycleEntry | undefined {
  return bazi.luckCycle?.cycles.find(
    (c) => year >= c.startYear && year <= c.endYear,
  );
}

function buildTransitPillar(
  type: TransitPillar["type"],
  pillar: Pillar,
  date: Date,
  dayMaster: string,
): TransitPillar {
  const hidden = BRANCH_HIDDEN_STEMS[pillar.branch] ?? [];
  const branchGods = hidden.map((s) => `${s}·${getTenGod(dayMaster as never, s)}`);
  return {
    type,
    date: formatDate(date),
    pillar: pillarToString(pillar),
    stem: pillar.stem,
    branch: pillar.branch,
    stemElement: STEM_ELEMENT[pillar.stem],
    branchElement: BRANCH_ELEMENT[pillar.branch],
    stemTenGod: getTenGod(dayMaster as never, pillar.stem),
    branchTenGods: branchGods,
  };
}

function analyzeTransitRelations(
  transitBranch: EarthlyBranch,
  transitLabel: string,
  bazi: BaziAlgorithmResult,
): TransitRelation[] {
  const natalKeys = ["年", "月", "日", "时"] as const;
  const natalPillars = [
    bazi.pillars.year,
    bazi.pillars.month,
    bazi.pillars.day,
    bazi.pillars.hour,
  ];
  const out: TransitRelation[] = [];

  for (let i = 0; i < natalPillars.length; i++) {
    const nb = natalPillars[i].branch;
    const key = natalKeys[i];
    if (branchesPair(transitBranch, nb, LIU_HE)) {
      out.push({
        type: "六合",
        transit: transitLabel,
        natal: `${key}支${nb}`,
        description: `${transitLabel}与${key}支${nb}六合，适合连接与缓和`,
      });
    }
    if (branchesPair(transitBranch, nb, LIU_CHONG)) {
      out.push({
        type: "冲",
        transit: transitLabel,
        natal: `${key}支${nb}`,
        description: `${transitLabel}冲${key}支${nb}，节奏宜放缓、沟通留余地`,
      });
    }
    if (branchesPair(transitBranch, nb, LIU_HAI)) {
      out.push({
        type: "害",
        transit: transitLabel,
        natal: `${key}支${nb}`,
        description: `${transitLabel}害${key}支${nb}，细节上宜多确认`,
      });
    }
  }

  const virtual = {
    year: bazi.pillars.year,
    month: bazi.pillars.month,
    day: { ...bazi.pillars.day, branch: transitBranch },
    hour: bazi.pillars.hour,
  };
  const rel = analyzeBranchRelations(virtual);
  for (const c of rel.analysis.combinations) {
    out.push({
      type: c.type,
      transit: transitLabel,
      natal: c.branches.join(""),
      description: c.description,
    });
  }
  for (const c of rel.analysis.meetings) {
    out.push({
      type: c.type,
      transit: transitLabel,
      natal: c.branches.join(""),
      description: c.description,
    });
  }

  return out;
}

function addElementImpact(
  impact: Record<FiveElement, number>,
  el: FiveElement,
  w: number,
) {
  impact[el] = (impact[el] ?? 0) + w;
}

function computeCategorySignals(
  bazi: BaziAlgorithmResult,
  ctx: Omit<TransitContext, "categorySignals">,
): Record<SubCategory, number> {
  const dm = bazi.pillars.day.stem;
  const dmStrength = bazi.dayMasterStrength.strengthLevel;
  const signals: Record<SubCategory, number> = {
    love: 0,
    wealth: 0,
    career: 0,
    study: 0,
    social: 0,
  };

  const dayGod = ctx.day.stemTenGod;
  const monthGod = ctx.month.stemTenGod;
  const yearGod = ctx.year.stemTenGod;
  const luckGod = ctx.currentLuckCycle?.stemTenGod;

  const applyGod = (god: TenGod | string | undefined, scale: number) => {
    if (!god) return;
    const g = god as TenGod;
    if (g === "正财" || g === "偏财") {
      signals.wealth += 4 * scale;
      if (dmStrength === "weak") signals.wealth -= 3 * scale;
      else signals.wealth += 2 * scale;
    }
    if (g === "正官" || g === "七杀") {
      const hasSeal =
        (bazi.tenGods.counts["正印"] ?? 0) + (bazi.tenGods.counts["偏印"] ?? 0) > 0;
      if (hasSeal && dmStrength !== "weak") signals.career += 5 * scale;
      else if (dmStrength === "weak") {
        signals.career -= 4 * scale;
      } else signals.career += 3 * scale;
    }
    if (g === "正印" || g === "偏印") {
      signals.study += 5 * scale;
      signals.social += 1 * scale;
    }
    if (g === "食神" || g === "伤官") {
      signals.social += 3 * scale;
      signals.study += 2 * scale;
      signals.love += 2 * scale;
    }
    if (g === "比肩" || g === "劫财") {
      signals.social += 2 * scale;
      signals.wealth -= 3 * scale;
    }
  };

  applyGod(dayGod, 1);
  applyGod(monthGod, 0.6);
  applyGod(yearGod, 0.5);
  if (luckGod) applyGod(luckGod, 0.7);

  for (const r of ctx.relations.dayRelations) {
    if (r.type === "六合") {
      signals.love += 5;
      signals.social += 3;
    }
    if (r.type === "冲") {
      signals.love -= 6;
      signals.social -= 3;
      if (r.natal.includes("月")) {
        signals.career -= 5;
        signals.study -= 3;
      }
    }
    if (r.type === "害") signals.social -= 2;
  }

  for (const r of ctx.relations.monthRelations) {
    if (r.type === "冲" && r.natal.includes("月")) signals.career -= 4;
    if (r.type === "六合") signals.career += 2;
  }

  const useful = bazi.usefulGods?.usefulElementTendency ?? [];
  const avoid = bazi.usefulGods?.avoidElementTendency ?? [];
  for (const el of useful) {
    if (ctx.elementImpact[el] > 0.5) {
      signals.wealth += 2;
      signals.career += 2;
      signals.study += 2;
    }
  }
  for (const el of avoid) {
    if (ctx.elementImpact[el] > 1) {
      signals.wealth -= 2;
      signals.career -= 2;
    }
  }

  if (bazi.symbolicStars.some((s) => s.name === "桃花" && s.found)) {
    signals.love += 3;
    signals.social += 2;
  }

  return signals;
}

export function calculateTransitContext(
  bazi: BaziAlgorithmResult,
  date: Date,
): TransitContext {
  const dm = bazi.pillars.day.stem;
  const dt = DateTime.fromObject(
    {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: 12,
    },
    { zone: TIMEZONE },
  );

  const yearResult = getYearPillar(dt, TIMEZONE);
  const monthResult = getMonthPillar(dt, yearResult.pillar.stem, TIMEZONE);
  const dayPillar = getDayPillarForDate(date);
  const luck = getLuckCycleAtYear(bazi, date.getFullYear());

  const year = buildTransitPillar("year", yearResult.pillar, date, dm);
  const month = buildTransitPillar("month", monthResult.pillar, date, dm);
  const day = buildTransitPillar("day", dayPillar, date, dm);

  const yearRelations = analyzeTransitRelations(
    year.branch,
    `流年${year.pillar}`,
    bazi,
  );
  const monthRelations = analyzeTransitRelations(
    month.branch,
    `流月${month.pillar}`,
    bazi,
  );
  const dayRelations = analyzeTransitRelations(
    day.branch,
    `流日${day.pillar}`,
    bazi,
  );

  let luckRelations: TransitRelation[] = [];
  if (luck) {
    luckRelations = analyzeTransitRelations(
      luck.pillar.branch,
      `大运${pillarToString(luck.pillar)}`,
      bazi,
    );
  }

  const elementImpact: Record<FiveElement, number> = {
    木: 0, 火: 0, 土: 0, 金: 0, 水: 0,
  };
  for (const p of [year, month, day]) {
    addElementImpact(elementImpact, p.stemElement, 1.2);
    addElementImpact(elementImpact, p.branchElement, 1);
  }
  if (luck) {
    addElementImpact(elementImpact, STEM_ELEMENT[luck.pillar.stem], 1.5);
    addElementImpact(elementImpact, BRANCH_ELEMENT[luck.pillar.branch], 1.2);
  }

  const useful = bazi.usefulGods?.usefulElementTendency ?? [];
  const avoid = bazi.usefulGods?.avoidElementTendency ?? [];
  let usefulGodAlignment = 0;
  let avoidGodPressure = 0;
  for (const el of useful) {
    usefulGodAlignment += elementImpact[el] * 2;
  }
  for (const el of avoid) {
    avoidGodPressure += elementImpact[el] * 2;
  }

  const partial: Omit<TransitContext, "categorySignals"> = {
    date,
    year,
    month,
    day,
    currentLuckCycle: luck,
    relations: { yearRelations, monthRelations, dayRelations, luckRelations },
    elementImpact,
    usefulGodAlignment,
    avoidGodPressure,
    evidence: [],
  };

  const categorySignals = computeCategorySignals(bazi, partial);
  const evidence: string[] = [];

  evidence.push(
    `流日${day.pillar}，${day.stem}为${day.stemTenGod}，引动当日主题`,
  );
  evidence.push(`流月${month.pillar}，${month.stemTenGod}主导当月节奏`);
  evidence.push(`流年${year.pillar}，${year.stemTenGod}影响全年背景`);

  if (luck) {
    evidence.push(
      `当前大运${pillarToString(luck.pillar)}（${luck.stemTenGod}），${luck.startYear}-${luck.endYear}年`,
    );
  }

  for (const r of dayRelations.slice(0, 3)) {
    evidence.push(r.description);
  }
  if (usefulGodAlignment > 2) {
    evidence.push("流期五行与喜用倾向较一致，相关事项更易顺势");
  }
  if (avoidGodPressure > 3) {
    evidence.push("流期加重忌神五行，宜放慢节奏、不宜硬推");
  }

  return { ...partial, categorySignals, evidence };
}

export function getMonthPillarForCalendarMonth(
  year: number,
  month: number,
): Pillar {
  const anchor = new Date(year, month - 1, 15);
  const dt = DateTime.fromObject(
    { year: anchor.getFullYear(), month: anchor.getMonth() + 1, day: 15, hour: 12 },
    { zone: TIMEZONE },
  );
  const yearPillar = getYearPillar(dt, TIMEZONE);
  return getMonthPillar(dt, yearPillar.pillar.stem, TIMEZONE).pillar;
}

export function deterministicTransitHash(
  period: string,
  start: string,
  end: string,
  pillarKey: string,
): number {
  let h = 0;
  const s = `${period}|${start}|${end}|${pillarKey}`;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
    h |= 0;
  }
  return (h % 5) - 2;
}
