import type { RuleResult } from "../shared/reportTypes";
import type { BaziRuleContext, Rule, RuleCategory } from "./types";
import {
  confidenceFromEvidence,
  evidenceWeight,
  mergeEvidence,
  normalizeEvidenceItems,
} from "./evidence";

const MAX_PER_CATEGORY = 8;

function dedupeSimilar(results: RuleResult[]): RuleResult[] {
  const byKey = new Map<string, RuleResult>();
  for (const r of results) {
    const key = `${r.category}:${r.message.slice(0, 24)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, r);
      continue;
    }

    const evidence = mergeEvidence(existing.evidence, r.evidence);
    byKey.set(key, {
      ...existing,
      score: Math.max(existing.score, r.score),
      tags: [...new Set([...existing.tags, ...r.tags])],
      evidence,
      confidence: Math.max(existing.confidence, confidenceFromEvidence(evidence)),
    });
  }
  return [...byKey.values()];
}

export function runRuleEngine(
  rules: Rule[],
  context: BaziRuleContext,
): RuleResult[] {
  const matched: RuleResult[] = [];

  for (const rule of rules) {
    if (!rule.condition(context)) continue;
    const evidence = normalizeEvidenceItems(rule.evidence(context), {
      ruleId: rule.id,
      category: rule.category,
      tags: rule.tags,
      baseWeight: Math.max(1, rule.priority / 25),
    });
    if (!evidence.length) continue;

    matched.push({
      ruleId: rule.id,
      category: rule.category,
      score: rule.score,
      message: rule.message,
      evidence,
      tags: rule.tags,
      confidence: confidenceFromEvidence(evidence),
    });
  }

  matched.sort((a, b) => {
    const byEvidence = evidenceWeight(b.evidence) - evidenceWeight(a.evidence);
    if (Math.abs(byEvidence) > 0.01) return byEvidence;
    return b.score - a.score;
  });

  const byCategory = new Map<RuleCategory, RuleResult[]>();
  for (const r of matched) {
    const cat = r.category as RuleCategory;
    const list = byCategory.get(cat) ?? [];
    if (list.length < MAX_PER_CATEGORY) list.push(r);
    byCategory.set(cat, list);
  }

  const grouped = [...byCategory.values()].flat();
  return dedupeSimilar(grouped).sort((a, b) => {
    const byEvidence = evidenceWeight(b.evidence) - evidenceWeight(a.evidence);
    if (Math.abs(byEvidence) > 0.01) return byEvidence;
    return b.confidence - a.confidence;
  });
}
