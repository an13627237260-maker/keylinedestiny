import { describe, expect, it } from "vitest";
import { analyzeLoveCompatibility } from "@/lib/fortune/bazi/compatibility";
import { generateLoveReport } from "@/lib/fortune/report/loveReport";
import type { BaziInput } from "@/lib/fortune/shared/validation";

const PERSON_A: BaziInput = {
  gender: "male",
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "love",
};

const PERSON_B: BaziInput = {
  gender: "female",
  birthDate: "1992-08-20",
  birthTime: "18:20",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "love",
};

describe("love compatibility", () => {
  it("matchScore 稳定且 attraction/conflict/advice 均有 evidence", () => {
    const a = analyzeLoveCompatibility(PERSON_A, PERSON_B).result;
    const b = analyzeLoveCompatibility(PERSON_A, PERSON_B).result;
    expect(a.matchScore).toBe(b.matchScore);
    expect(a.attractionPoints).toEqual(b.attractionPoints);
    expect(a.conflictPoints).toEqual(b.conflictPoints);
    expect(a.evidence.attractionPoints.length).toBeGreaterThan(0);
    expect(a.evidence.conflictPoints.length).toBeGreaterThan(0);
    expect(a.evidence.advice.length).toBeGreaterThan(0);
    for (const item of [
      ...a.evidence.attractionPoints,
      ...a.evidence.conflictPoints,
      ...a.evidence.advice,
    ]) {
      expect(item.source).toBeTruthy();
      expect(item.category).toBe("love");
      expect(item.weight).toBeGreaterThan(0);
      expect(item.detail).toBeTruthy();
    }
  });

  it("合盘报告章节引用 evidence 且不含绝对断语", () => {
    const result = analyzeLoveCompatibility(PERSON_A, PERSON_B).result;
    const report = generateLoveReport(result);
    expect(report.sections.length).toBeGreaterThanOrEqual(5);
    for (const section of report.sections) {
      expect(section.evidence?.length).toBeGreaterThan(0);
    }
    const text = [
      report.summary,
      ...report.sections.map((section) => section.content),
      ...report.advice,
    ].join("");
    for (const word of ["必定结婚", "一定分手", "正缘唯一", "断言出轨"]) {
      expect(text).not.toContain(word);
    }
  });
});
