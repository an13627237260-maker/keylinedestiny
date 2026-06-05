export const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;

export const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export const FIVE_ELEMENTS = ["木", "火", "土", "金", "水"] as const;

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];
export type FiveElement = (typeof FIVE_ELEMENTS)[number];

export const STEM_YIN_YANG: Record<HeavenlyStem, "阳" | "阴"> = {
  甲: "阳",
  乙: "阴",
  丙: "阳",
  丁: "阴",
  戊: "阳",
  己: "阴",
  庚: "阳",
  辛: "阴",
  壬: "阳",
  癸: "阴",
};

export const BRANCH_YIN_YANG: Record<EarthlyBranch, "阳" | "阴"> = {
  子: "阳",
  丑: "阴",
  寅: "阳",
  卯: "阴",
  辰: "阳",
  巳: "阴",
  午: "阳",
  未: "阴",
  申: "阳",
  酉: "阴",
  戌: "阳",
  亥: "阴",
};

export const STEM_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const BRANCH_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

/** 1984 年为甲子年，作为年柱基准 */
export const YEAR_PILLAR_BASE_YEAR = 1984;
export const YEAR_PILLAR_BASE_INDEX = 0;

/** 日柱基准：1984-02-02 为甲子日，JDN=2445733 */
export const DAY_PILLAR_BASE_JDN = 2445733;
export const DAY_PILLAR_BASE_INDEX = 0;
export const DAY_PILLAR_JDN_OFFSET = 47;

/** 十二节（月令分界），不含中气 */
export const MONTH_BOUNDARY_TERMS = [
  "立春",
  "惊蛰",
  "清明",
  "立夏",
  "芒种",
  "小暑",
  "立秋",
  "白露",
  "寒露",
  "立冬",
  "大雪",
  "小寒",
] as const;

export const MONTH_BRANCHES: EarthlyBranch[] = [
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
  "子",
  "丑",
];

/** 年干 -> 寅月月干 */
export const YEAR_STEM_TO_YIN_MONTH_STEM: Record<HeavenlyStem, HeavenlyStem> = {
  甲: "丙",
  己: "丙",
  乙: "戊",
  庚: "戊",
  丙: "庚",
  辛: "庚",
  丁: "壬",
  壬: "壬",
  戊: "甲",
  癸: "甲",
};

/** 日干 -> 子时时干 */
export const DAY_STEM_TO_ZI_HOUR_STEM: Record<HeavenlyStem, HeavenlyStem> = {
  甲: "甲",
  己: "甲",
  乙: "丙",
  庚: "丙",
  丙: "戊",
  辛: "戊",
  丁: "庚",
  壬: "庚",
  戊: "壬",
  癸: "壬",
};

export const ELEMENT_GENERATES: Record<FiveElement, FiveElement> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

export const ELEMENT_CONTROLS: Record<FiveElement, FiveElement> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

export const SEASON_ELEMENT_BY_MONTH_BRANCH: Record<EarthlyBranch, FiveElement> =
  {
    寅: "木",
    卯: "木",
    辰: "木",
    巳: "火",
    午: "火",
    未: "火",
    申: "金",
    酉: "金",
    戌: "金",
    亥: "水",
    子: "水",
    丑: "水",
  };

export const EARTH_MONTH_BRANCHES: EarthlyBranch[] = ["辰", "戌", "丑", "未"];
