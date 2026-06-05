export interface ReportSection {
  title: string;
  content: string;
  highlights?: string[];
  warnings?: string[];
}

export interface FortuneReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  advice: string[];
  disclaimer: string;
}

export interface RuleResult {
  ruleId: string;
  category: string;
  score: number;
  message: string;
  evidence: string[];
  tags: string[];
}
