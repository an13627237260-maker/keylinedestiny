import type { CalculationStep } from "../shared/types";
import { getStrokeCount } from "./strokes";
import type {
  CustomStrokeEntry,
  FiveGrid,
  NameAnalysisResult,
  StrokeMode,
  ThreeTalent,
} from "./types";

export type { FiveGrid, ThreeTalent };

function strokeToElement(n: number): string {
  const mod = n % 10;
  if (mod === 1 || mod === 2) return "木";
  if (mod === 3 || mod === 4) return "火";
  if (mod === 5 || mod === 6) return "土";
  if (mod === 7 || mod === 8) return "金";
  return "水";
}

const LUCKY_NUMBERS = new Set([
  1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 31, 32, 33, 35,
  37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81,
]);

function gridLuckLabel(n: number): string {
  if (LUCKY_NUMBERS.has(n)) return "偏吉";
  if (n % 10 === 4 || n % 10 === 9) return "宜留意";
  return "平稳";
}

function gridExplain(name: string, n: number): string {
  const label = gridLuckLabel(n);
  return `${name}${n}画，${label}，仅作姓名学简化参考`;
}

export function calculateFiveGrid(
  surname: string,
  givenName: string,
  mode: StrokeMode,
  customMap?: Record<string, CustomStrokeEntry>,
): {
  fiveGrid: FiveGrid | null;
  missingChars: string[];
  strokes: number[];
  charStrokes: Array<{ char: string; strokes: number; warning?: string }>;
  warnings: string[];
} {
  const chars = [...surname, ...givenName];
  const strokes: number[] = [];
  const charStrokes: Array<{ char: string; strokes: number; warning?: string }> = [];
  const missingChars: string[] = [];
  const warnings: string[] = [];

  for (const char of chars) {
    const { stroke, warning, source } = getStrokeCount(char, mode, customMap);
    if (stroke === null) {
      missingChars.push(char);
    } else {
      strokes.push(stroke);
      charStrokes.push({ char, strokes: stroke, warning });
      if (warning) warnings.push(warning);
      if (source === "custom") warnings.push(`${char}：使用手动补充笔画`);
    }
  }

  if (missingChars.length > 0 || strokes.length !== chars.length) {
    return { fiveGrid: null, missingChars, strokes, charStrokes, warnings };
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
    charStrokes,
    warnings,
  };
}

export function analyzeThreeTalent(fiveGrid: FiveGrid): ThreeTalent {
  const tian = strokeToElement(fiveGrid.tianGe);
  const ren = strokeToElement(fiveGrid.renGe);
  const di = strokeToElement(fiveGrid.diGe);
  return { tian, ren, di, config: `${tian}${ren}${di}` };
}

export function scoreName(fiveGrid: FiveGrid): number {
  const nums = [
    fiveGrid.tianGe,
    fiveGrid.renGe,
    fiveGrid.diGe,
    fiveGrid.waiGe,
    fiveGrid.zongGe,
  ];
  let score = 62;
  for (const n of nums) {
    if (LUCKY_NUMBERS.has(n)) score += 4;
    else if (n % 10 === 4 || n % 10 === 9) score -= 2;
    else score += 1;
  }
  return Math.max(55, Math.min(92, score));
}

function buildInsights(
  fiveGrid: FiveGrid,
  threeTalent: ThreeTalent,
  nameScore: number,
): {
  strengths: string[];
  cautions: string[];
  suggestions: string[];
  personalityHints: string[];
  careerHints: string[];
  relationshipHints: string[];
} {
  return {
    strengths: [
      `人格${fiveGrid.renGe}画（${gridLuckLabel(fiveGrid.renGe)}），主性格与自我表达方式`,
      `三才${threeTalent.config}，五行搭配有可参考的节奏感`,
      `综合评分约 ${nameScore} 分，整体处于常见姓名区间`,
    ],
    cautions: [
      gridLuckLabel(fiveGrid.waiGe) === "宜留意"
        ? `外格${fiveGrid.waiGe}画，人际表达宜更圆融`
        : "不同姓名学流派对吉凶判断有差异，勿作绝对结论",
      "五格为简化模型，不能替代个人努力与选择",
      "笔画模式不同可能导致结果略有差异",
    ],
    suggestions: [
      "可把姓名看作自我认同符号，重点在行为与习惯的积累",
      "若关注事业，可结合专业能力与学习节奏综合规划",
      "人际方面，表达清晰比追求完美笔画更重要",
      "定期复盘目标，比纠结某一格吉凶更有实际帮助",
      "姓名学适合作为文化参考，不宜过度焦虑",
    ],
    personalityHints: [
      `人格格数 ${fiveGrid.renGe}，${gridExplain("人格", fiveGrid.renGe)}`,
      `天格 ${fiveGrid.tianGe} 反映早年环境与家族影响倾向`,
      `地格 ${fiveGrid.diGe} 与内在安全感、基础习惯相关`,
    ],
    careerHints: [
      `总格 ${fiveGrid.zongGe} 与长期发展方向的整体节奏相关`,
      "事业成长更依赖技能、经验与机遇，姓名仅作辅助参考",
    ],
    relationshipHints: [
      `外格 ${fiveGrid.waiGe} 可作为人际互动风格的参考线索`,
      "感情相处重在沟通与尊重，不宜仅凭姓名判断缘分",
    ],
  };
}

export function analyzeName(
  fullName: string,
  mode: StrokeMode = "simplified",
  customMap?: Record<string, CustomStrokeEntry>,
): {
  analysis: NameAnalysisResult;
  calculation_steps: CalculationStep[];
  warnings: string[];
} {
  const trimmed = fullName.trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      analysis: {
        status: "error",
        error: { code: "INVALID_NAME", message: "请输入至少两个字的姓名" },
      },
      calculation_steps: [],
      warnings: [],
    };
  }

  const surname = trimmed[0] ?? "";
  const givenName = trimmed.slice(1);
  const { fiveGrid, missingChars, strokes, charStrokes, warnings } =
    calculateFiveGrid(surname, givenName, mode, customMap);

  warnings.push("采用五格剖象法简化模型，不同流派可能有差异");

  const modeLabel =
    mode === "simplified" ? "简体笔画" : mode === "traditional" ? "繁体笔画" : "康熙笔画";

  if (missingChars.length > 0) {
    return {
      analysis: {
        status: "needs_strokes",
        missingChars,
        partialResult: {
          name: trimmed,
          mode,
          knownStrokes: charStrokes.map((c) => ({
            char: c.char,
            strokes: c.strokes,
          })),
        },
        message: "部分汉字缺少笔画数据，请补充后继续分析。",
      },
      calculation_steps: [
        {
          step: "name_strokes",
          title: "姓名笔画",
          input: { name: trimmed, mode: modeLabel },
          method: "五格剖象法",
          result: { missingChars, knownStrokes: charStrokes },
          notes: ["部分汉字暂未收录，可手动补充笔画"],
        },
      ],
      warnings,
    };
  }

  const threeTalent = analyzeThreeTalent(fiveGrid!);
  const nameScore = scoreName(fiveGrid!);
  const insights = buildInsights(fiveGrid!, threeTalent, nameScore);

  return {
    analysis: {
      status: "success",
      missingChars: [],
      result: {
        name: trimmed,
        mode,
        strokes,
        charStrokes,
        fiveGrid: fiveGrid!,
        threeTalent,
        nameScore,
        method: "五格剖象法简化模型",
        ...insights,
      },
    },
    calculation_steps: [
      {
        step: "name_strokes",
        title: "姓名笔画与五格",
        input: { name: trimmed, mode: modeLabel },
        method: "天格/人格/地格/外格/总格",
        result: {
          charStrokes,
          fiveGrid,
          threeTalent,
          nameScore,
        },
        notes: warnings,
      },
    ],
    warnings,
  };
}

/** @deprecated 兼容旧调用，请使用 analyzeName 返回的 analysis */
export function analyzeNameLegacy(
  fullName: string,
  script: "simplified" | "traditional",
  customMap?: Record<string, CustomStrokeEntry>,
) {
  const { analysis, calculation_steps, warnings } = analyzeName(
    fullName,
    script,
    customMap,
  );
  if (analysis.status === "success") {
    return {
      algorithm_result: {
        name: analysis.result.name,
        script: analysis.result.mode,
        strokes: analysis.result.strokes,
        charStrokes: analysis.result.charStrokes,
        fiveGrid: analysis.result.fiveGrid,
        threeTalent: analysis.result.threeTalent,
        nameScore: analysis.result.nameScore,
        strengths: analysis.result.strengths,
        cautions: analysis.result.cautions,
        suggestions: analysis.result.suggestions,
        personalityHints: analysis.result.personalityHints,
        careerHints: analysis.result.careerHints,
        relationshipHints: analysis.result.relationshipHints,
        method: analysis.result.method,
      },
      calculation_steps,
      warnings,
    };
  }
  return {
    algorithm_result: {
      name: fullName.trim(),
      script,
      missingChars: analysis.status === "needs_strokes" ? analysis.missingChars : [],
      status: analysis.status,
      message: analysis.status === "needs_strokes" ? analysis.message : undefined,
      method: "五格剖象法简化模型",
    },
    calculation_steps,
    warnings,
  };
}
