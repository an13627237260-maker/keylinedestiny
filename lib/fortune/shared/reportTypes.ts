import type { EvidenceItem } from "../rules/evidence";

export interface ReportSection {
  title: string;
  content: string;
  conclusion?: string;
  basis?: string[];
  evidenceIds?: string[];
  advice?: string;
  highlights?: string[];
  warnings?: string[];
  evidence?: EvidenceItem[];
}

export interface FortuneReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  advice: string[];
  adviceEvidenceIds?: string[];
  disclaimer: string;
}

export interface RuleResult {
  ruleId: string;
  category: string;
  score: number;
  message: string;
  evidence: EvidenceItem[];
  tags: string[];
  confidence: number;
}
