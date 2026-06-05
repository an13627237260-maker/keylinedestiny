import type { CalculationStep } from "../shared/types";
import type { HeavenlyStem } from "./constants";
import type { FourPillars } from "./pillars";

export interface StemRelation {
  type: "合" | "冲";
  stems: [HeavenlyStem, HeavenlyStem];
  result?: string;
  pillars: string[];
}

export interface StemRelationsAnalysis {
  combinations: StemRelation[];
  clashes: StemRelation[];
  affectedPillars: string[];
  interpretationTags: string[];
}

const STEM_COMBINATIONS: Array<{ pair: [HeavenlyStem, HeavenlyStem]; result: string }> = [
  { pair: ["甲", "己"], result: "土" },
  { pair: ["乙", "庚"], result: "金" },
  { pair: ["丙", "辛"], result: "水" },
  { pair: ["丁", "壬"], result: "木" },
  { pair: ["戊", "癸"], result: "火" },
];

const STEM_CLASHES: Array<[HeavenlyStem, HeavenlyStem]> = [
  ["甲", "庚"],
  ["乙", "辛"],
  ["丙", "壬"],
  ["丁", "癸"],
];

function pillarKeys(pillars: FourPillars): Array<{ key: string; stem: HeavenlyStem }> {
  return [
    { key: "year", stem: pillars.year.stem },
    { key: "month", stem: pillars.month.stem },
    { key: "day", stem: pillars.day.stem },
    { key: "hour", stem: pillars.hour.stem },
  ];
}

export function analyzeStemRelations(
  pillars: FourPillars,
): { analysis: StemRelationsAnalysis; step: CalculationStep } {
  const entries = pillarKeys(pillars);
  const combinations: StemRelation[] = [];
  const clashes: StemRelation[] = [];
  const affectedPillars = new Set<string>();
  const interpretationTags: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      for (const combo of STEM_COMBINATIONS) {
        const [s1, s2] = combo.pair;
        if (
          (a.stem === s1 && b.stem === s2) ||
          (a.stem === s2 && b.stem === s1)
        ) {
          combinations.push({
            type: "合",
            stems: combo.pair,
            result: combo.result,
            pillars: [a.key, b.key],
          });
          affectedPillars.add(a.key);
          affectedPillars.add(b.key);
          interpretationTags.push(`${a.key}-${b.key}天干五合`);
        }
      }
      for (const [s1, s2] of STEM_CLASHES) {
        if (
          (a.stem === s1 && b.stem === s2) ||
          (a.stem === s2 && b.stem === s1)
        ) {
          clashes.push({
            type: "冲",
            stems: [s1, s2],
            pillars: [a.key, b.key],
          });
          affectedPillars.add(a.key);
          affectedPillars.add(b.key);
          interpretationTags.push(`${a.key}-${b.key}天干相冲`);
        }
      }
    }
  }

  const analysis: StemRelationsAnalysis = {
    combinations,
    clashes,
    affectedPillars: [...affectedPillars],
    interpretationTags,
  };

  return {
    analysis,
    step: {
      step: "stem_relations",
      title: "天干合冲",
      input: { pillars: entries.map((e) => e.stem) },
      method: "天干五合与四冲",
      result: analysis as unknown as Record<string, unknown>,
      notes: [],
    },
  };
}
