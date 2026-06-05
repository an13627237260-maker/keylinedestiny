import type { DataSourceMeta, DataSourceType } from "./types";

export const DATA_SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  local_builtin: "本地内置数据",
  online_verified: "精确联网数据",
  approx_algorithm: "近似算法",
  user_manual: "用户手动输入",
};

export const DATA_SOURCE_CONFIDENCE_LABELS: Record<
  DataSourceMeta["confidence"],
  string
> = {
  high: "高",
  medium: "中",
  low: "低",
};

export function getDataSourceLabel(meta: DataSourceMeta): string {
  const base = DATA_SOURCE_TYPE_LABELS[meta.sourceType];
  if (meta.fromCache) return `${base}（缓存）`;
  if (meta.fallbackUsed) return `${base}（已回退）`;
  return base;
}

export function summarizeDataSource(meta: DataSourceMeta): string {
  const parts = [getDataSourceLabel(meta), meta.providerName];
  parts.push(`可信度：${DATA_SOURCE_CONFIDENCE_LABELS[meta.confidence]}`);
  if (meta.requestedOnline) parts.push("已尝试联网");
  if (meta.fallbackUsed) parts.push("使用回退");
  return parts.join(" · ");
}
