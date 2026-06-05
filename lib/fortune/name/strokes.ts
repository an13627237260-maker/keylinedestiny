import { STROKE_BULK } from "./strokeBulk";
import type { CustomStrokeEntry, StrokeEntry, StrokeMode } from "./types";

export type { StrokeEntry };

export const STROKE_MAP: Record<string, StrokeEntry> = { ...STROKE_BULK };

export interface StrokeLookupResult {
  stroke: number | null;
  warning?: string;
  source: "custom" | "builtin" | "traditionalChar" | "none";
}

export function getStrokeCount(
  char: string,
  mode: StrokeMode,
  customMap?: Record<string, CustomStrokeEntry>,
): StrokeLookupResult {
  const custom = customMap?.[char];
  if (custom) {
    if (mode === "kangxi" && custom.kangxi != null) {
      return { stroke: custom.kangxi, source: "custom" };
    }
    if (mode === "traditional" && custom.traditional != null) {
      return { stroke: custom.traditional, source: "custom" };
    }
    if (custom.simplified != null) {
      return { stroke: custom.simplified, source: "custom" };
    }
  }

  const entry = STROKE_MAP[char];
  if (!entry) {
    return { stroke: null, source: "none" };
  }

  if (mode === "kangxi") {
    const k = entry.kangxi ?? entry.traditional ?? entry.simplified;
    return {
      stroke: k,
      source: "builtin",
      warning:
        entry.kangxi == null
          ? `${char}：暂无康熙笔画，暂用繁体/简体笔画`
          : undefined,
    };
  }

  if (mode === "traditional") {
    if (entry.traditional != null) {
      return { stroke: entry.traditional, source: "builtin" };
    }
    return {
      stroke: entry.simplified,
      source: "builtin",
      warning: `${char}：暂无繁体笔画，暂用简体笔画`,
    };
  }

  return { stroke: entry.simplified, source: "builtin" };
}

export function resolveCharForMode(char: string, mode: StrokeMode): string {
  if (mode === "traditional" || mode === "kangxi") {
    const entry = STROKE_MAP[char];
    if (entry?.traditionalChar) return entry.traditionalChar;
  }
  return char;
}
