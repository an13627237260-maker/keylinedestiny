export type StrokeMode = "simplified" | "traditional" | "kangxi";

export interface StrokeEntry {
  char?: string;
  simplified: number;
  traditional?: number;
  kangxi?: number;
  traditionalChar?: string;
}

export interface CustomStrokeEntry {
  simplified?: number;
  traditional?: number;
  kangxi?: number;
}

export interface FiveGrid {
  tianGe: number;
  renGe: number;
  diGe: number;
  waiGe: number;
  zongGe: number;
}

export interface ThreeTalent {
  tian: string;
  ren: string;
  di: string;
  config: string;
}

export interface NameSuccessResult {
  name: string;
  mode: StrokeMode;
  strokes: number[];
  charStrokes: Array<{ char: string; strokes: number; warning?: string }>;
  fiveGrid: FiveGrid;
  threeTalent: ThreeTalent;
  nameScore: number;
  method: string;
  strengths: string[];
  cautions: string[];
  suggestions: string[];
  personalityHints: string[];
  careerHints: string[];
  relationshipHints: string[];
}

export type NameAnalysisResult =
  | { status: "success"; missingChars: []; result: NameSuccessResult }
  | {
      status: "needs_strokes";
      missingChars: string[];
      partialResult: {
        name: string;
        mode: StrokeMode;
        knownStrokes: Array<{ char: string; strokes: number }>;
      };
      message: string;
    }
  | { status: "error"; error: { code: string; message: string } };

export type NameAnalysisSuccess = Extract<
  NameAnalysisResult,
  { status: "success" }
>;
