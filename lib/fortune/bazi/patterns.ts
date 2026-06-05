import type { CalculationStep } from "../shared/types";
import type { TenGodsAnalysis } from "./tenGods";
import type { DayMasterStrengthAnalysis } from "./dayMasterStrength";
import type { SymbolicStar } from "./symbolicStars";
import type { FourPillars } from "./pillars";

interface PatternAlgoInput {
  pillars: FourPillars;
  tenGods: TenGodsAnalysis;
  dayMasterStrength: DayMasterStrengthAnalysis;
  symbolicStars: SymbolicStar[];
}

export interface PatternTendency {
  patternName: string;
  confidence: number;
  evidence: string[];
  cautions: string[];
  interpretationTags: string[];
}

export function analyzePatterns(algo: PatternAlgoInput): {
  tendencies: PatternTendency[];
  step: CalculationStep;
} {
  const tg = algo.tenGods;
  const dm = algo.dayMasterStrength;
  const sorted = Object.entries(tg.counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0]?.[0] ?? "比肩";
  const second = sorted[1]?.[0] ?? "";
  const monthBranch = algo.pillars.month.branch;
  const monthMainGod = tg.hiddenStemGods
    .filter((item) => item.branch === monthBranch)
    .sort((a, b) => b.weight - a.weight)[0]?.god;
  const exposedGods = new Set([
    tg.pillarStemGods.year,
    tg.pillarStemGods.month,
    tg.pillarStemGods.hour,
  ]);
  const tendencies: PatternTendency[] = [];

  const add = (p: PatternTendency) =>
    tendencies.push({ ...p, confidence: Math.min(75, p.confidence) });

  const godPatterns: Record<string, string> = {
    正官: "正官格倾向",
    七杀: "七杀格倾向",
    正财: "正财格倾向",
    偏财: "偏财格倾向",
    食神: "食神格倾向",
    伤官: "伤官格倾向",
    正印: "正印格倾向",
    偏印: "偏印格倾向",
  };

  const hasMonthlyEvidence =
    !!monthMainGod && (monthMainGod === top || exposedGods.has(monthMainGod));

  if (godPatterns[monthMainGod ?? ""] && hasMonthlyEvidence) {
    add({
      patternName: godPatterns[monthMainGod!],
      confidence: 55 + Math.min(20, (tg.counts[monthMainGod!] ?? 0) * 6),
      evidence: [
        `月支${monthBranch}主气对应${monthMainGod}`,
        exposedGods.has(monthMainGod!) ? `${monthMainGod}透干` : `${monthMainGod}未明显透干，仅作倾向`,
      ],
      cautions: ["格局倾向不等于定论，需结合大运流年"],
      interpretationTags: [monthMainGod!],
    });
  }

  if (dm.strengthLevel === "strong" && (tg.counts["比肩"] ?? 0) + (tg.counts["劫财"] ?? 0) > 2) {
    add({
      patternName: "建禄格倾向",
      confidence: monthMainGod === "比肩" || monthMainGod === "劫财" ? 65 : 55,
      evidence: ["日主偏强且比劫明显", `月令主气为${monthMainGod ?? "未明"}`],
      cautions: ["需防固执与竞争消耗"],
      interpretationTags: ["身强", "比劫"],
    });
  }

  const hasYangBlade = algo.symbolicStars.some((s) => s.name === "羊刃" && s.found);
  if (hasYangBlade && (monthMainGod === "比肩" || monthMainGod === "劫财")) {
    add({
      patternName: "羊刃格倾向",
      confidence: 58,
      evidence: ["命局见羊刃", "月令或比劫证据支持时只作羊刃倾向"],
      cautions: ["竞争与果断并存，宜修边界"],
      interpretationTags: ["羊刃"],
    });
  }

  if (dm.strengthLevel === "weak" && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 2 && (monthMainGod === "正财" || monthMainGod === "偏财")) {
    add({
      patternName: "身弱财重倾向",
      confidence: 68,
      evidence: ["财星旺而日主偏弱", `月令主气为${monthMainGod}`],
      cautions: ["机会与压力并存，宜先固本"],
      interpretationTags: ["财重身弱"],
    });
  }

  if (dm.strengthLevel === "strong" && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 1.5 && exposedGods.has("正财")) {
    add({
      patternName: "身强财旺倾向",
      confidence: 62,
      evidence: ["日主能担财且财星透出"],
      cautions: ["宜务实理财，忌贪快"],
      interpretationTags: ["身强财旺"],
    });
  }

  if ((tg.counts["七杀"] ?? 0) > 1 && (tg.counts["正印"] ?? 0) + (tg.counts["偏印"] ?? 0) > 1) {
    add({
      patternName: "杀印相生倾向",
      confidence: 72,
      evidence: ["七杀与印星并见"],
      cautions: ["压力可转化为成长动力"],
      interpretationTags: ["杀印相生"],
    });
  }

  if ((tg.counts["食神"] ?? 0) + (tg.counts["伤官"] ?? 0) > 1.5 && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 1) {
    add({
      patternName: "食伤生财倾向",
      confidence: 70,
      evidence: ["食伤与财星联动"],
      cautions: ["宜把技能转化为稳定产出"],
      interpretationTags: ["食伤生财"],
    });
  }

  if ((tg.counts["正官"] ?? 0) > 1 && (tg.counts["正印"] ?? 0) + (tg.counts["偏印"] ?? 0) > 1) {
    add({
      patternName: "官印相生倾向",
      confidence: 74,
      evidence: ["正官与印星并见"],
      cautions: ["适合规范路径与证书积累"],
      interpretationTags: ["官印相生"],
    });
  }

  if ((tg.counts["伤官"] ?? 0) > 1.5 && (tg.counts["正官"] ?? 0) > 1) {
    add({
      patternName: "伤官见官倾向",
      confidence: 62,
      evidence: ["伤官与正官同见"],
      cautions: ["与规则权威易有摩擦，宜修沟通"],
      interpretationTags: ["伤官见官"],
    });
  }

  if ((tg.counts["比肩"] ?? 0) + (tg.counts["劫财"] ?? 0) > 2 && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 1) {
    add({
      patternName: "比劫夺财倾向",
      confidence: 64,
      evidence: ["比劫与财星并旺"],
      cautions: ["合伙与人情开支需设边界"],
      interpretationTags: ["比劫夺财"],
    });
  }

  const supportCount = dm.supportFactors.length;
  const extremeWeak = dm.strengthLevel === "weak" && dm.strengthScore <= 28 && supportCount <= 1;

  if (extremeWeak && (tg.counts["七杀"] ?? 0) > 3 && monthMainGod === "七杀") {
    add({
      patternName: "从杀倾向",
      confidence: 50,
      evidence: ["杀重身轻且月令见杀", "从格条件仍需专业复核"],
      cautions: ["仅作倾向参考，非绝对从格"],
      interpretationTags: ["从杀倾向"],
    });
  }

  if (extremeWeak && (tg.counts["食神"] ?? 0) + (tg.counts["伤官"] ?? 0) > 3 && (monthMainGod === "食神" || monthMainGod === "伤官")) {
    add({
      patternName: "从儿倾向",
      confidence: 50,
      evidence: ["食伤重而日主弱且月令支持", "从格条件仍需专业复核"],
      cautions: ["宜以才华输出为主轴"],
      interpretationTags: ["从儿倾向"],
    });
  }

  if (extremeWeak && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 3.5 && (monthMainGod === "正财" || monthMainGod === "偏财")) {
    add({
      patternName: "从财倾向",
      confidence: 50,
      evidence: ["财旺身轻且月令支持", "从格条件仍需专业复核"],
      cautions: ["资源导向强，宜量力而行"],
      interpretationTags: ["从财倾向"],
    });
  }

  if (!tendencies.length) {
    add({
      patternName: "格局证据不足，暂不定格",
      confidence: 35,
      evidence: [
        `月支${monthBranch}主气为${monthMainGod ?? "未能确定"}`,
        `主要十神为${top}${second ? `与${second}` : ""}，但月令/透干证据不足`,
      ],
      cautions: ["格局为倾向分析，未作专业定格。"],
      interpretationTags: ["不定格"],
    });
  }

  return {
    tendencies: tendencies.slice(0, 8),
    step: {
      step: "patterns",
      title: "格局倾向分析",
      input: { dayMaster: dm.dayMaster },
      method: "基于月令主气、透干、十神结构、日主强弱与神煞辅助的 patternTendencies",
      result: { count: tendencies.length },
      notes: ["格局为倾向分析，未作专业定格。"],
    },
  };
}
