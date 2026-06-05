import type { CalculationStep } from "../shared/types";
import type { EarthlyBranch, HeavenlyStem } from "./constants";
import type { FourPillars } from "./pillars";

export interface SymbolicStar {
  name: string;
  found: boolean;
  positions: string[];
  basedOn: string;
  meaning: string;
  strength: "强" | "中" | "弱";
  caution: string;
}

/** 桃花：以年支或日支查 */
export function findPeachBlossom(
  pillars: FourPillars,
): SymbolicStar {
  const map: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    寅: "卯",
    午: "卯",
    戌: "卯",
    申: "酉",
    子: "酉",
    辰: "酉",
    亥: "子",
    卯: "子",
    未: "子",
    巳: "午",
    酉: "午",
    丑: "午",
  };
  const refs = [pillars.year.branch, pillars.day.branch];
  const positions: string[] = [];
  for (const ref of refs) {
    const target = map[ref];
    if (!target) continue;
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch,
      month: pillars.month.branch,
      day: pillars.day.branch,
      hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return {
    name: "桃花",
    found: positions.length > 0,
    positions,
    basedOn: "年支/日支查桃花表",
    meaning: "人缘、魅力、情感机缘",
    strength: positions.length > 1 ? "强" : positions.length === 1 ? "中" : "弱",
    caution: "仅供娱乐参考，不代表感情结果",
  };
}

/** 驿马 */
export function findTravelHorse(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    寅: "申",
    午: "申",
    戌: "申",
    申: "寅",
    子: "寅",
    辰: "寅",
    巳: "亥",
    酉: "亥",
    丑: "亥",
    亥: "巳",
    卯: "巳",
    未: "巳",
  };
  const positions: string[] = [];
  for (const ref of [pillars.year.branch, pillars.day.branch]) {
    const target = map[ref];
    if (!target) continue;
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch,
      month: pillars.month.branch,
      day: pillars.day.branch,
      hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return {
    name: "驿马",
    found: positions.length > 0,
    positions,
    basedOn: "年支/日支查驿马",
    meaning: "变动、出行、迁移",
    strength: positions.length > 0 ? "中" : "弱",
    caution: "变动倾向不等于必然发生",
  };
}

/** 华盖 */
export function findCanopyStar(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    寅: "戌",
    午: "戌",
    戌: "戌",
    亥: "未",
    卯: "未",
    未: "未",
    申: "辰",
    子: "辰",
    辰: "辰",
    巳: "丑",
    酉: "丑",
    丑: "丑",
  };
  const positions: string[] = [];
  for (const ref of [pillars.year.branch, pillars.day.branch]) {
    const target = map[ref];
    if (!target) continue;
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch,
      month: pillars.month.branch,
      day: pillars.day.branch,
      hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return {
    name: "华盖",
    found: positions.length > 0,
    positions,
    basedOn: "年支/日支查华盖",
    meaning: "独处、艺术、精神追求",
    strength: positions.length > 0 ? "中" : "弱",
    caution: "性格倾向描述，非命运定论",
  };
}

/** 天乙贵人 */
export function findNobleStar(
  pillars: FourPillars,
): SymbolicStar {
  const map: Partial<Record<HeavenlyStem, EarthlyBranch[]>> = {
    甲: ["丑", "未"],
    戊: ["丑", "未"],
    乙: ["子", "申"],
    己: ["子", "申"],
    丙: ["亥", "酉"],
    丁: ["亥", "酉"],
    庚: ["丑", "未"],
    辛: ["寅", "午"],
    壬: ["卯", "巳"],
    癸: ["卯", "巳"],
  };
  const targets = map[pillars.day.stem] ?? [];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch,
    month: pillars.month.branch,
    day: pillars.day.branch,
    hour: pillars.hour.branch,
  })) {
    if (targets.includes(branch)) positions.push(key);
  }
  return {
    name: "天乙贵人",
    found: positions.length > 0,
    positions,
    basedOn: "日干查天乙贵人",
    meaning: "贵人缘、协助机遇",
    strength: positions.length > 1 ? "强" : positions.length === 1 ? "中" : "弱",
    caution: "机遇标签，非必然遇贵人",
  };
}

/** 文昌贵人 */
export function findLiteraryStar(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
    甲: "巳",
    乙: "午",
    丙: "申",
    丁: "酉",
    戊: "申",
    己: "酉",
    庚: "亥",
    辛: "子",
    壬: "寅",
    癸: "卯",
  };
  const target = map[pillars.day.stem];
  const positions: string[] = [];
  if (target) {
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch,
      month: pillars.month.branch,
      day: pillars.day.branch,
      hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return {
    name: "文昌贵人",
    found: positions.length > 0,
    positions,
    basedOn: "日干查文昌",
    meaning: "学习、文采、考试",
    strength: positions.length > 0 ? "中" : "弱",
    caution: "学业倾向参考",
  };
}

/** 羊刃 */
export function findYangBlade(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
    甲: "卯",
    丙: "午",
    戊: "午",
    庚: "酉",
    壬: "子",
  };
  const target = map[pillars.day.stem];
  const positions: string[] = [];
  if (target) {
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch,
      month: pillars.month.branch,
      day: pillars.day.branch,
      hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return {
    name: "羊刃",
    found: positions.length > 0,
    positions,
    basedOn: "日干查羊刃",
    meaning: "刚烈、果断、竞争",
    strength: positions.length > 0 ? "中" : "弱",
    caution: "性格特征标签，非凶险断言",
  };
}

/** 禄神 */
export function findLuStar(pillars: FourPillars): SymbolicStar {
  const map: Record<HeavenlyStem, EarthlyBranch> = {
    甲: "寅",
    乙: "卯",
    丙: "巳",
    丁: "午",
    戊: "巳",
    己: "午",
    庚: "申",
    辛: "酉",
    壬: "亥",
    癸: "子",
  };
  const target = map[pillars.day.stem];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch,
    month: pillars.month.branch,
    day: pillars.day.branch,
    hour: pillars.hour.branch,
  })) {
    if (branch === target) positions.push(key);
  }
  return {
    name: "禄神",
    found: positions.length > 0,
    positions,
    basedOn: "日干查禄神",
    meaning: "福禄、稳定、自身资源",
    strength: positions.length > 0 ? "中" : "弱",
    caution: "资源倾向描述",
  };
}

/** 空亡 */
export function findVoidness(pillars: FourPillars): SymbolicStar {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const dayIdx = pillars.day.index;
  const voidBranches = [
    branches[(dayIdx + 10) % 12],
    branches[(dayIdx + 11) % 12],
  ];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch,
    month: pillars.month.branch,
    day: pillars.day.branch,
    hour: pillars.hour.branch,
  })) {
    if (voidBranches.includes(branch)) positions.push(key);
  }
  return {
    name: "空亡",
    found: positions.length > 0,
    positions,
    basedOn: "日柱旬空",
    meaning: "落空、延迟、虚浮",
    strength: positions.length > 0 ? "中" : "弱",
    caution: "空亡为辅助概念，不作绝对否定",
  };
}

export function analyzeSymbolicStars(
  pillars: FourPillars,
): { stars: SymbolicStar[]; step: CalculationStep } {
  const stars = [
    findPeachBlossom(pillars),
    findTravelHorse(pillars),
    findCanopyStar(pillars),
    findNobleStar(pillars),
    findLiteraryStar(pillars),
    findYangBlade(pillars),
    findLuStar(pillars),
    findVoidness(pillars),
  ];

  return {
    stars,
    step: {
      step: "symbolic_stars",
      title: "神煞分析",
      input: { dayPillar: `${pillars.day.stem}${pillars.day.branch}` },
      method: "各神煞独立查法，仅作辅助标签",
      result: { stars: stars.filter((s) => s.found).map((s) => s.name) },
      notes: ["神煞不参与绝对判断"],
    },
  };
}
