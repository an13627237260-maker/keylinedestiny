import type { CalculationStep } from "../shared/types";
import { getStrokeCount } from "./strokes";

export interface FiveGrid {
  tianGe: number;
  renGe: number;
  diGe: number;
  waiGe: number;
  zongGe: number;
}

export interface ThreeTalent {
  tian: string;
  ren: string;
  di: string;
  config: string;
}

function strokeToElement(n: number): string {
  const mod = n % 10;
  if (mod === 1 || mod === 2) return "木";
  if (mod === 3 || mod === 4) return "火";
  if (mod === 5 || mod === 6) return "土";
  if (mod === 7 || mod === 8) return "金";
  return "水";
}

export function calculateFiveGrid(
  surname: string,
  givenName: string,
  script: "simplified" | "traditional",
): {
  fiveGrid: FiveGrid | null;
  missingChars: string[];
  strokes: number[];
  warnings: string[];
} {
  const chars = [...surname, ...givenName];
  const strokes: number[] = [];
  const missingChars: string[] = [];
  const warnings: string[] = [];

  for (const char of chars) {
    const { stroke, warning } = getStrokeCount(char, script);
    if (stroke === null) {
      missingChars.push(char);
    } else {
      strokes.push(stroke);
      if (warning) warnings.push(`${char}: ${warning}`);
    }
  }

  if (missingChars.length > 0 || strokes.length !== chars.length) {
    return { fiveGrid: null, missingChars, strokes, warnings };
  }

  const sLen = [...surname].length;
  const gLen = [...givenName].length;
  const s1 = strokes[0];
  const s2 = strokes[1] ?? s1;
  const last = strokes[strokes.length - 1];
  const last2 = strokes[strokes.length - 2] ?? last;

  let tianGe: number;
  if (sLen === 1) tianGe = s1 + 1;
  else tianGe = s1 + s2;

  const renGe = sLen === 1 ? s1 + strokes[sLen] : s2 + strokes[sLen];
  let diGe: number;
  if (gLen === 1) diGe = last + 1;
  else diGe = last2 + last;

  let waiGe: number;
  if (sLen === 1 && gLen === 1) waiGe = 2;
  else if (sLen === 1) waiGe = last + 1;
  else if (gLen === 1) waiGe = s1 + 1;
  else waiGe = s1 + last;

  const zongGe = strokes.reduce((a, b) => a + b, 0);

  return {
    fiveGrid: { tianGe, renGe, diGe, waiGe, zongGe },
    missingChars,
    strokes,
    warnings,
  };
}

export function analyzeThreeTalent(fiveGrid: FiveGrid): ThreeTalent {
  const tian = strokeToElement(fiveGrid.tianGe);
  const ren = strokeToElement(fiveGrid.renGe);
  const di = strokeToElement(fiveGrid.diGe);
  return {
    tian,
    ren,
    di,
    config: `${tian}${ren}${di}`,
  };
}

export function scoreName(fiveGrid: FiveGrid): number {
  const nums = [
    fiveGrid.tianGe,
    fiveGrid.renGe,
    fiveGrid.diGe,
    fiveGrid.waiGe,
    fiveGrid.zongGe,
  ];
  let score = 60;
  for (const n of nums) {
    const mod = n % 10;
    if ([1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81].includes(n)) {
      score += 4;
    } else if (mod === 4 || mod === 9) {
      score -= 2;
    }
  }
  return Math.max(40, Math.min(95, score));
}

export function analyzeName(
  fullName: string,
  script: "simplified" | "traditional",
): {
  algorithm_result: Record<string, unknown>;
  calculation_steps: CalculationStep[];
  warnings: string[];
} {
  const trimmed = fullName.trim();
  const surname = trimmed[0] ?? "";
  const givenName = trimmed.slice(1);
  const { fiveGrid, missingChars, strokes, warnings } = calculateFiveGrid(
    surname,
    givenName,
    script,
  );

  warnings.push("采用五格剖象法简化模型，不同流派可能有差异");

  if (!fiveGrid) {
    return {
      algorithm_result: {
        name: trimmed,
        script,
        missingChars,
        method: "五格剖象法简化模型",
      },
      calculation_steps: [
        {
          step: "name_strokes",
          title: "姓名笔画",
          input: { name: trimmed, script },
          method: "五格剖象法",
          result: { missingChars, strokes },
          notes: ["缺少笔画数据的字无法计算，不会猜测"],
        },
      ],
      warnings,
    };
  }

  const threeTalent = analyzeThreeTalent(fiveGrid);
  const nameScore = scoreName(fiveGrid);

  return {
    algorithm_result: {
      name: trimmed,
      script,
      strokes,
      fiveGrid,
      threeTalent,
      nameScore,
      personalityHints: [`人格${fiveGrid.renGe}画，三才${threeTalent.config}`],
      careerHints: ["姓名学仅提供倾向参考，需结合个人努力"],
      relationshipHints: ["外格与总格可观察人际表达风格"],
      method: "五格剖象法简化模型",
    },
    calculation_steps: [
      {
        step: "name_strokes",
        title: "姓名笔画与五格",
        input: { name: trimmed, script },
        method: "天格/人格/地格/外格/总格",
        result: { fiveGrid, threeTalent, nameScore },
        notes: warnings,
      },
    ],
    warnings,
  };
}
