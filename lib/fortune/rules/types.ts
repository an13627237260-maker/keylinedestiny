import type { BaziAlgorithmResult } from "../bazi";
import type { EvidenceItem } from "./evidence";

export type RuleCategory =
  | "personality"
  | "love"
  | "relationship"
  | "career"
  | "wealth"
  | "study"
  | "health"
  | "family"
  | "yearly"
  | "advice";

export interface BaziRuleContext {
  algo: BaziAlgorithmResult;
  focusArea: string;
}

export interface Rule {
  id: string;
  category: RuleCategory;
  priority: number;
  condition: (ctx: BaziRuleContext) => boolean;
  score: number;
  tags: string[];
  message: string;
  evidence: (ctx: BaziRuleContext) => Array<EvidenceItem | string>;
}
