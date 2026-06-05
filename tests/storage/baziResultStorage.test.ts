import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLastBaziResult,
  loadLastBaziResult,
  saveLastBaziResult,
  savedBaziInputsEqual,
  type BaziAnalysisResult,
  type SavedBaziFormInput,
} from "@/lib/storage/baziFormStorage";

const INPUT: SavedBaziFormInput = {
  gender: "male",
  birthDate: "1990-05-15",
  birthTime: "10:30",
  province: "北京市",
  city: "北京市",
  latitude: 39.9042,
  longitude: 116.4074,
  timezone: "Asia/Shanghai",
  useTrueSolarTime: true,
  focusArea: "overall",
  dayBoundaryMode: "midnight",
  savedAt: "2026-06-05T00:00:00.000Z",
  version: 1,
};

const RESULT = {
  success: true,
  type: "bazi",
  input: {},
  algorithm_result: { pillarStrings: { year: "庚午", month: "辛巳", day: "庚午", hour: "辛巳" } },
  rule_results: [],
  report: { title: "报告", summary: "摘要", sections: [], advice: [], disclaimer: "" },
  calculation_steps: [],
  warnings: [],
  disclaimer: "",
} as unknown as BaziAnalysisResult;

describe("baziResultStorage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("排盘成功后保存 lastResult", () => {
    saveLastBaziResult(INPUT, RESULT);
    const loaded = loadLastBaziResult();
    expect(loaded?.result.algorithm_result).toBeDefined();
    expect(loaded?.input.birthDate).toBe(INPUT.birthDate);
  });

  it("input 未变时可恢复 lastResult", () => {
    saveLastBaziResult(INPUT, RESULT);
    const loaded = loadLastBaziResult();
    expect(savedBaziInputsEqual(INPUT, loaded?.input)).toBe(true);
  });

  it("input 改变后不展示旧 result", () => {
    saveLastBaziResult(INPUT, RESULT);
    const changed = { ...INPUT, birthTime: "11:30" };
    const loaded = loadLastBaziResult();
    expect(savedBaziInputsEqual(changed, loaded?.input)).toBe(false);
  });

  it("清除 lastResult 成功", () => {
    saveLastBaziResult(INPUT, RESULT);
    clearLastBaziResult();
    expect(loadLastBaziResult()).toBeNull();
  });

  it("localStorage 不可用时页面逻辑不崩溃", () => {
    const original = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    });
    expect(() => saveLastBaziResult(INPUT, RESULT)).not.toThrow();
    expect(loadLastBaziResult()).toBeNull();
    Object.defineProperty(window, "localStorage", { configurable: true, value: original });
  });
});
