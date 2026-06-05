import type { BaziAlgorithmResult } from "../bazi";

export type RuleCategory =
  | "personality"
  | "love"
  | "career"
  | "wealth"
  | "study"
  | "health"
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
  evidence: (ctx: BaziRuleContext) => string[];
}
