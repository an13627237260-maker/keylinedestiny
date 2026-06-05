export const STRENGTH_LEVEL_LABELS: Record<string, string> = {
  strong: "偏强",
  balanced: "中和",
  weak: "偏弱",
};

export const FOCUS_AREA_LABELS: Record<string, string> = {
  overall: "综合",
  love: "感情",
  career: "事业",
  wealth: "财运",
  study: "学业",
  health: "生活方式",
};

export const GENDER_LABELS: Record<string, string> = {
  male: "男",
  female: "女",
  unknown: "未说明",
};

export const LUCK_DIRECTION_LABELS: Record<string, string> = {
  forward: "顺排",
  backward: "逆排",
  unknown: "未计算",
};

export const PILLAR_LABELS: Record<string, string> = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  hour: "时柱",
};

export function labelStrength(level?: string): string {
  if (!level) return "—";
  return STRENGTH_LEVEL_LABELS[level] ?? level;
}

export function labelFocusArea(area?: string): string {
  if (!area) return "综合";
  return FOCUS_AREA_LABELS[area] ?? area;
}

export function labelGender(gender?: string): string {
  if (!gender) return "未说明";
  return GENDER_LABELS[gender] ?? gender;
}

export function labelLuckDirection(dir?: string): string {
  if (!dir) return "未计算";
  return LUCK_DIRECTION_LABELS[dir] ?? dir;
}

export function labelPillar(key: string): string {
  return PILLAR_LABELS[key] ?? key;
}
