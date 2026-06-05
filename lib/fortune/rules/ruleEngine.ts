import type { RuleResult } from "../shared/reportTypes";
import type { BaziRuleContext, Rule, RuleCategory } from "./types";

const MAX_PER_CATEGORY = 8;

function dedupeSimilar(results: RuleResult[]): RuleResult[] {
  const seen = new Set<string>();
  const out: RuleResult[] = [];
  for (const r of results) {
    const key = `${r.category}:${r.message.slice(0, 24)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function runRuleEngine(
  rules: Rule[],
  context: BaziRuleContext,
): RuleResult[] {
  const matched: RuleResult[] = [];

  for (const rule of rules) {
    if (!rule.condition(context)) continue;
    matched.push({
      ruleId: rule.id,
      category: rule.category,
      score: rule.score,
      message: rule.message,
      evidence: rule.evidence(context),
      tags: rule.tags,
    });
  }

  matched.sort((a, b) => b.score - a.score);

  const byCategory = new Map<RuleCategory, RuleResult[]>();
  for (const r of matched) {
    const cat = r.category as RuleCategory;
    const list = byCategory.get(cat) ?? [];
    if (list.length < MAX_PER_CATEGORY) list.push(r);
    byCategory.set(cat, list);
  }

  const grouped = [...byCategory.values()].flat();
  return dedupeSimilar(grouped).sort((a, b) => b.score - a.score);
}
