import type { EvidenceItem } from "../rules/evidence";

export type LuckPeriod = "day" | "week" | "month" | "year";

export type LuckCategory =
  | "overall"
  | "love"
  | "wealth"
  | "career"
  | "study"
  | "social";

export interface LuckScore {
  category: LuckCategory;
  label: string;
  score: number;
  level: string;
  color: string;
  keywords: string[];
  summary: string;
  detail: string;
  advice: string[];
  evidence: EvidenceItem[];
  scoreBreakdown: {
    base: number;
    luckCycleImpact: number;
    yearImpact: number;
    monthImpact: number;
    dayImpact: number;
    usefulGodImpact: number;
    relationImpact: number;
    locationImpact: number;
    periodHashAdjustment: number;
    final: number;
  };
}

export interface TransitSummary {
  yearPillar: string;
  monthPillar?: string;
  dayPillar?: string;
  luckCyclePillar?: string;
  dominantElements: string[];
  dominantTenGods: string[];
  importantRelations: string[];
}

export interface PeriodInsights {
  bestTimes: string[];
  cautionTimes: string[];
  mainTheme: string;
  actionSuggestion: string;
}

export interface LuckOverview {
  period: LuckPeriod;
  dateLabel: string;
  startDate: string;
  endDate: string;
  overallScore: number;
  overallLevel: string;
  scores: LuckScore[];
  highlights: string[];
  cautions: string[];
  calculationBasis: string[];
  transitSummary: TransitSummary;
  periodInsights: PeriodInsights;
  debugHash?: string;
}

export interface LuckOverviewSet {
  day: LuckOverview;
  week: LuckOverview;
  month: LuckOverview;
  year: LuckOverview;
}

export const LUCK_CATEGORY_COLORS: Record<
  Exclude<LuckCategory, "overall">,
  string
> = {
  love: "#EC6FAE",
  wealth: "#D6B56D",
  career: "#6C91E8",
  study: "#41C7D9",
  social: "#B56BE8",
};

export const LUCK_CATEGORY_LABELS: Record<
  Exclude<LuckCategory, "overall">,
  string
> = {
  love: "爱情",
  wealth: "财富",
  career: "事业",
  study: "学习",
  social: "人际",
};
