export interface EvidenceItem {
  id: string;
  source:
    | "natal_pillar"
    | "five_elements"
    | "day_master_strength"
    | "ten_gods"
    | "stem_relation"
    | "branch_relation"
    | "symbolic_star"
    | "twelve_growth"
    | "nayin"
    | "pattern"
    | "useful_god"
    | "climate"
    | "spouse_palace"
    | "health_tendency"
    | "domain_analysis"
    | "luck_cycle"
    | "year_transit"
    | "month_transit"
    | "day_transit"
    | "location"
    | "score_model";
  category:
    | "overall"
    | "personality"
    | "love"
    | "relationship"
    | "wealth"
    | "career"
    | "study"
    | "health"
    | "family"
    | "social"
    | "timing"
    | "advice";
  weight: number;
  polarity: "positive" | "negative" | "neutral";
  title: string;
  detail: string;
  relatedPillars?: string[];
  relatedElements?: string[];
  relatedTenGods?: string[];
  relatedRelations?: string[];
}

export type EvidenceCategory = EvidenceItem["category"];
export type EvidenceSource = EvidenceItem["source"];
export type EvidencePolarity = EvidenceItem["polarity"];

export function stableEvidenceId(prefix: string, text: string): string {
  let hash = 2166136261;
  const value = `${prefix}|${text}`;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${(hash >>> 0).toString(16)}`;
}

export function ruleCategoryToEvidenceCategory(category: string): EvidenceCategory {
  if (category === "yearly") return "timing";
  if (
    category === "personality" ||
    category === "love" ||
    category === "relationship" ||
    category === "wealth" ||
    category === "career" ||
    category === "study" ||
    category === "health" ||
    category === "family" ||
    category === "advice" ||
    category === "social" ||
    category === "overall"
  ) {
    return category;
  }
  return "overall";
}

export function inferEvidenceSource(text: string, tags: string[] = []): EvidenceSource {
  const haystack = `${text} ${tags.join(" ")}`;
  if (haystack.includes("流日")) return "day_transit";
  if (haystack.includes("流月")) return "month_transit";
  if (haystack.includes("流年")) return "year_transit";
  if (haystack.includes("大运")) return "luck_cycle";
  if (haystack.includes("夫妻宫") || haystack.includes("伴侣星") || haystack.includes("感情关系")) return "spouse_palace";
  if (haystack.includes("健康") || haystack.includes("睡眠") || haystack.includes("脾胃") || haystack.includes("寒湿")) return "health_tendency";
  if (haystack.includes("调候") || haystack.includes("寒") || haystack.includes("燥") || haystack.includes("湿") || haystack.includes("热")) return "climate";
  if (haystack.includes("真太阳时") || haystack.includes("地域") || haystack.includes("经度")) return "location";
  if (haystack.includes("喜用") || haystack.includes("忌神")) return "useful_god";
  if (haystack.includes("格局")) return "pattern";
  if (haystack.includes("神") || haystack.includes("财") || haystack.includes("官") || haystack.includes("印") || haystack.includes("食伤") || haystack.includes("比劫")) return "ten_gods";
  if (haystack.includes("日主") || haystack.includes("得令") || haystack.includes("得地") || haystack.includes("得助")) return "day_master_strength";
  if (haystack.includes("五行") || haystack.includes("木") || haystack.includes("火") || haystack.includes("土") || haystack.includes("金") || haystack.includes("水")) return "five_elements";
  if (haystack.includes("冲") || haystack.includes("合") || haystack.includes("刑") || haystack.includes("害")) return "branch_relation";
  return "score_model";
}

export function inferEvidencePolarity(text: string): EvidencePolarity {
  if (
    text.includes("弱") ||
    text.includes("冲") ||
    text.includes("害") ||
    text.includes("刑") ||
    text.includes("忌") ||
    text.includes("压力") ||
    text.includes("谨慎") ||
    text.includes("放慢")
  ) {
    return "negative";
  }
  if (
    text.includes("旺") ||
    text.includes("合") ||
    text.includes("喜用") ||
    text.includes("支持") ||
    text.includes("较顺") ||
    text.includes("突出") ||
    text.includes("一致")
  ) {
    return "positive";
  }
  return "neutral";
}

export function normalizeEvidenceItems(
  raw: Array<EvidenceItem | string | null | undefined>,
  fallback: {
    ruleId: string;
    category: string;
    tags?: string[];
    baseWeight?: number;
    source?: EvidenceSource;
  },
): EvidenceItem[] {
  const tags = fallback.tags ?? [];
  return raw
    .map((item, index): EvidenceItem | null => {
      if (!item) return null;
      if (typeof item !== "string") {
        return {
          ...item,
          id: item.id || stableEvidenceId(fallback.ruleId, `${item.title}:${item.detail}`),
          weight: Number.isFinite(item.weight) ? item.weight : fallback.baseWeight ?? 1,
        };
      }

      const detail = item.trim();
      if (!detail) return null;
      return {
        id: stableEvidenceId(fallback.ruleId, `${index}:${detail}`),
        source: fallback.source ?? inferEvidenceSource(detail, tags),
        category: ruleCategoryToEvidenceCategory(fallback.category),
        weight: fallback.baseWeight ?? 1,
        polarity: inferEvidencePolarity(detail),
        title: tags[0] ?? fallback.ruleId,
        detail,
        relatedTenGods: tags.filter((t) => /财|官|印|食神|伤官|比肩|劫财|七杀/.test(t)),
        relatedElements: tags.filter((t) => /木|火|土|金|水/.test(t)),
        relatedRelations: tags.filter((t) => /冲|合|刑|害|会/.test(t)),
      };
    })
    .filter((item): item is EvidenceItem => !!item);
}

export function evidenceWeight(items: EvidenceItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
}

export function confidenceFromEvidence(items: EvidenceItem[]): number {
  if (!items.length) return 0;
  const raw = 0.35 + Math.min(0.5, evidenceWeight(items) / 16) + Math.min(0.15, items.length / 20);
  return Number(Math.min(0.98, raw).toFixed(2));
}

export function mergeEvidence(a: EvidenceItem[], b: EvidenceItem[]): EvidenceItem[] {
  const byId = new Map<string, EvidenceItem>();
  for (const item of [...a, ...b]) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      continue;
    }
    byId.set(item.id, {
      ...existing,
      weight: Math.max(existing.weight, item.weight),
      detail: existing.detail === item.detail ? existing.detail : `${existing.detail}；${item.detail}`,
    });
  }
  return [...byId.values()].sort((x, y) => y.weight - x.weight);
}
