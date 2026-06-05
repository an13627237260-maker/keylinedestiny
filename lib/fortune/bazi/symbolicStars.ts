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
    caution: "变动倾向只作趋势参考",
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
    caution: "机遇标签，不作事件断语",
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

/** 将星：以年支或日支查 */
export function findGeneralStar(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    寅: "午", 午: "午", 戌: "午",
    申: "子", 子: "子", 辰: "子",
    巳: "酉", 酉: "酉", 丑: "酉",
    亥: "卯", 卯: "卯", 未: "卯",
  };
  const positions: string[] = [];
  for (const ref of [pillars.year.branch, pillars.day.branch]) {
    const target = map[ref];
    if (!target) continue;
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch, month: pillars.month.branch,
      day: pillars.day.branch, hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return { name: "将星", found: positions.length > 0, positions, basedOn: "年支/日支查将星", meaning: "组织、领导、担当", strength: positions.length > 0 ? "中" : "弱", caution: "领导气质标签" };
}

export function findTaiJiNoble(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<HeavenlyStem, EarthlyBranch[]>> = {
    甲: ["子", "午"], 乙: ["子", "午"], 丙: ["卯", "酉"], 丁: ["卯", "酉"],
    戊: ["辰", "戌", "丑", "未"], 己: ["辰", "戌", "丑", "未"],
    庚: ["寅", "亥"], 辛: ["寅", "亥"], 壬: ["巳", "申"], 癸: ["巳", "申"],
  };
  const targets = map[pillars.day.stem] ?? [];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch, month: pillars.month.branch,
    day: pillars.day.branch, hour: pillars.hour.branch,
  })) {
    if (targets.includes(branch)) positions.push(key);
  }
  return { name: "太极贵人", found: positions.length > 0, positions, basedOn: "日干查太极贵人", meaning: "玄学、哲学、深层思考", strength: positions.length > 0 ? "中" : "弱", caution: "兴趣倾向" };
}

export function findNationalSeal(pillars: FourPillars): SymbolicStar {
  const map: Record<HeavenlyStem, EarthlyBranch> = {
    甲: "戌", 乙: "亥", 丙: "丑", 丁: "寅", 戊: "丑",
    己: "寅", 庚: "辰", 辛: "巳", 壬: "未", 癸: "申",
  };
  const target = map[pillars.day.stem];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch, month: pillars.month.branch,
    day: pillars.day.branch, hour: pillars.hour.branch,
  })) {
    if (branch === target) positions.push(key);
  }
  return { name: "国印贵人", found: positions.length > 0, positions, basedOn: "日干查国印", meaning: "信用、名誉、制度缘", strength: positions.length > 0 ? "中" : "弱", caution: "辅助标签" };
}

export function findFuStar(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
    甲: "寅", 乙: "丑", 丙: "子", 丁: "亥", 戊: "酉",
    己: "申", 庚: "未", 辛: "午", 壬: "巳", 癸: "辰",
  };
  const target = map[pillars.day.stem];
  const positions: string[] = [];
  if (target) {
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch, month: pillars.month.branch,
      day: pillars.day.branch, hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return { name: "福星贵人", found: positions.length > 0, positions, basedOn: "日干查福星", meaning: "福禄、顺遂感", strength: positions.length > 0 ? "弱" : "弱", caution: "娱乐参考" };
}

export function findTianDe(pillars: FourPillars): SymbolicStar {
  const monthToStem: Partial<Record<EarthlyBranch, HeavenlyStem>> = {
    寅: "丁", 辰: "壬", 巳: "辛", 未: "甲", 申: "癸", 戌: "丙", 亥: "乙", 丑: "庚",
  };
  const monthToBranch: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    卯: "申", 午: "亥", 酉: "寅", 子: "巳",
  };
  const positions: string[] = [];
  const stemTarget = monthToStem[pillars.month.branch];
  if (stemTarget) {
    for (const [key, stem] of Object.entries({
      year: pillars.year.stem, month: pillars.month.stem,
      day: pillars.day.stem, hour: pillars.hour.stem,
    })) {
      if (stem === stemTarget) positions.push(key);
    }
  }
  const branchTarget = monthToBranch[pillars.month.branch];
  if (branchTarget) {
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch, month: pillars.month.branch,
      day: pillars.day.branch, hour: pillars.hour.branch,
    })) {
      if (branch === branchTarget) positions.push(key);
    }
  }
  return { name: "天德贵人", found: positions.length > 0, positions, basedOn: "月支查天德", meaning: "化解、贵人、顺遂", strength: positions.length > 0 ? "中" : "弱", caution: "辅助参考" };
}

export function findYueDe(pillars: FourPillars): SymbolicStar {
  const groups: Array<{ months: EarthlyBranch[]; target: HeavenlyStem }> = [
    { months: ["寅", "午", "戌"], target: "丙" },
    { months: ["申", "子", "辰"], target: "壬" },
    { months: ["亥", "卯", "未"], target: "甲" },
    { months: ["巳", "酉", "丑"], target: "庚" },
  ];
  let targetStem: HeavenlyStem | undefined;
  for (const g of groups) {
    if (g.months.includes(pillars.month.branch)) {
      targetStem = g.target;
      break;
    }
  }
  const positions: string[] = [];
  if (targetStem) {
    for (const [key, stem] of Object.entries({
      year: pillars.year.stem, month: pillars.month.stem,
      day: pillars.day.stem, hour: pillars.hour.stem,
    })) {
      if (stem === targetStem) positions.push(key);
    }
  }
  return { name: "月德贵人", found: positions.length > 0, positions, basedOn: "月支查月德干", meaning: "温和、人缘、化解", strength: positions.length > 0 ? "中" : "弱", caution: "辅助参考" };
}

export function findHongLuan(pillars: FourPillars): SymbolicStar {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const yearIdx = branches.indexOf(pillars.year.branch);
  const target = branches[(yearIdx + 1) % 12];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch, month: pillars.month.branch,
    day: pillars.day.branch, hour: pillars.hour.branch,
  })) {
    if (branch === target) positions.push(key);
  }
  return { name: "红鸾", found: positions.length > 0, positions, basedOn: "年支查红鸾", meaning: "喜庆、姻缘、社交", strength: positions.length > 0 ? "中" : "弱", caution: "只作社交与喜庆场景倾向参考" };
}

export function findTianXi(pillars: FourPillars): SymbolicStar {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const yearIdx = branches.indexOf(pillars.year.branch);
  const target = branches[(yearIdx + 11) % 12];
  const positions: string[] = [];
  for (const [key, branch] of Object.entries({
    year: pillars.year.branch, month: pillars.month.branch,
    day: pillars.day.branch, hour: pillars.hour.branch,
  })) {
    if (branch === target) positions.push(key);
  }
  return { name: "天喜", found: positions.length > 0, positions, basedOn: "年支查天喜", meaning: "喜庆、好消息", strength: positions.length > 0 ? "中" : "弱", caution: "娱乐参考" };
}

export function findXianChi(pillars: FourPillars): SymbolicStar {
  return { ...findPeachBlossom(pillars), name: "咸池", basedOn: "与桃花同法", meaning: "魅力、情感、人缘", caution: "仅供娱乐" };
}

export function findGuChen(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    寅: "巳", 卯: "巳", 辰: "巳", 巳: "申", 午: "申", 未: "申",
    申: "亥", 酉: "亥", 戌: "亥", 亥: "寅", 子: "寅", 丑: "寅",
  };
  const target = map[pillars.year.branch];
  const positions: string[] = [];
  if (target) {
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch, month: pillars.month.branch,
      day: pillars.day.branch, hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return { name: "孤辰", found: positions.length > 0, positions, basedOn: "年支查孤辰", meaning: "独处、独立", strength: positions.length > 0 ? "弱" : "弱", caution: "性格标签非定论" };
}

export function findGuaSu(pillars: FourPillars): SymbolicStar {
  const map: Partial<Record<EarthlyBranch, EarthlyBranch>> = {
    寅: "丑", 卯: "丑", 辰: "丑", 巳: "辰", 午: "辰", 未: "辰",
    申: "未", 酉: "未", 戌: "未", 亥: "戌", 子: "戌", 丑: "戌",
  };
  const target = map[pillars.year.branch];
  const positions: string[] = [];
  if (target) {
    for (const [key, branch] of Object.entries({
      year: pillars.year.branch, month: pillars.month.branch,
      day: pillars.day.branch, hour: pillars.hour.branch,
    })) {
      if (branch === target) positions.push(key);
    }
  }
  return { name: "寡宿", found: positions.length > 0, positions, basedOn: "年支查寡宿", meaning: "独立、清静", strength: positions.length > 0 ? "弱" : "弱", caution: "不代表孤独终老" };
}

export function analyzeSymbolicStars(
  pillars: FourPillars,
): { stars: SymbolicStar[]; step: CalculationStep } {
  const stars = [
    findPeachBlossom(pillars),
    findXianChi(pillars),
    findTravelHorse(pillars),
    findCanopyStar(pillars),
    findNobleStar(pillars),
    findLiteraryStar(pillars),
    findYangBlade(pillars),
    findLuStar(pillars),
    findVoidness(pillars),
    findGeneralStar(pillars),
    findTaiJiNoble(pillars),
    findNationalSeal(pillars),
    findFuStar(pillars),
    findTianDe(pillars),
    findYueDe(pillars),
    findHongLuan(pillars),
    findTianXi(pillars),
    findGuChen(pillars),
    findGuaSu(pillars),
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
