import type { CalculationStep } from "../shared/types";
import type { TenGodsAnalysis } from "./tenGods";
import type { DayMasterStrengthAnalysis } from "./dayMasterStrength";
import type { SymbolicStar } from "./symbolicStars";

interface PatternAlgoInput {
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
  const tendencies: PatternTendency[] = [];

  const add = (p: PatternTendency) => tendencies.push(p);

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

  if (godPatterns[top]) {
    add({
      patternName: godPatterns[top],
      confidence: Math.min(85, 50 + sorted[0][1] * 10),
      evidence: [`月令与十神中${top}较突出`],
      cautions: ["格局倾向不等于定论，需结合大运流年"],
      interpretationTags: [top],
    });
  }

  if (dm.strengthLevel === "strong" && (tg.counts["比肩"] ?? 0) + (tg.counts["劫财"] ?? 0) > 2) {
    add({
      patternName: "建禄格倾向",
      confidence: 65,
      evidence: ["日主偏强且比劫明显"],
      cautions: ["需防固执与竞争消耗"],
      interpretationTags: ["身强", "比劫"],
    });
  }

  const hasYangBlade = algo.symbolicStars.some((s) => s.name === "羊刃" && s.found);
  if (hasYangBlade) {
    add({
      patternName: "羊刃格倾向",
      confidence: 60,
      evidence: ["命局见羊刃"],
      cautions: ["竞争与果断并存，宜修边界"],
      interpretationTags: ["羊刃"],
    });
  }

  if (dm.strengthLevel === "weak" && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 2) {
    add({
      patternName: "身弱财重倾向",
      confidence: 70,
      evidence: ["财星旺而日主偏弱"],
      cautions: ["机会与压力并存，宜先固本"],
      interpretationTags: ["财重身弱"],
    });
  }

  if (dm.strengthLevel === "strong" && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 1.5) {
    add({
      patternName: "身强财旺倾向",
      confidence: 68,
      evidence: ["日主能担财且财星不弱"],
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

  if (dm.strengthLevel === "weak" && (tg.counts["七杀"] ?? 0) > 2) {
    add({
      patternName: "从杀倾向",
      confidence: 55,
      evidence: ["杀重身轻"],
      cautions: ["仅作倾向参考，非绝对从格"],
      interpretationTags: ["从杀倾向"],
    });
  }

  if (dm.strengthLevel === "weak" && (tg.counts["食神"] ?? 0) + (tg.counts["伤官"] ?? 0) > 2) {
    add({
      patternName: "从儿倾向",
      confidence: 55,
      evidence: ["食伤重而日主弱"],
      cautions: ["宜以才华输出为主轴"],
      interpretationTags: ["从儿倾向"],
    });
  }

  if (dm.strengthLevel === "weak" && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 2.5) {
    add({
      patternName: "从财倾向",
      confidence: 55,
      evidence: ["财旺身轻"],
      cautions: ["资源导向强，宜量力而行"],
      interpretationTags: ["从财倾向"],
    });
  }

  if (!tendencies.length) {
    add({
      patternName: "中和杂气倾向",
      confidence: 50,
      evidence: [`主要十神为${top}${second ? `与${second}` : ""}`],
      cautions: ["格局不极端，发展看大运触发"],
      interpretationTags: ["中和"],
    });
  }

  return {
    tendencies: tendencies.slice(0, 8),
    step: {
      step: "patterns",
      title: "格局初判",
      input: { dayMaster: dm.dayMaster },
      method: "基于十神结构、日主强弱、神煞的 patternTendencies",
      result: { count: tendencies.length },
      notes: ["第一版输出倾向而非绝对格局定论"],
    },
  };
}
