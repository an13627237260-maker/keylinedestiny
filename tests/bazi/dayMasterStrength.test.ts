import { describe, expect, it } from "vitest";
import {
  analyzeDayMasterStrength,
} from "@/lib/fortune/bazi/dayMasterStrength";
import { getAllHiddenStems } from "@/lib/fortune/bazi/hiddenStems";
import type {
  EarthlyBranch,
  HeavenlyStem,
} from "@/lib/fortune/bazi/constants";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";

function p(stem: HeavenlyStem, branch: EarthlyBranch, index: number) {
  return { stem, branch, index };
}

function pillars(input: {
  year: [HeavenlyStem, EarthlyBranch];
  month: [HeavenlyStem, EarthlyBranch];
  day: [HeavenlyStem, EarthlyBranch];
  hour: [HeavenlyStem, EarthlyBranch];
}): FourPillars {
  return {
    year: p(input.year[0], input.year[1], 0),
    month: p(input.month[0], input.month[1], 1),
    day: p(input.day[0], input.day[1], 2),
    hour: p(input.hour[0], input.hour[1], 3),
  };
}

function analyze(input: FourPillars) {
  return analyzeDayMasterStrength(
    input,
    getAllHiddenStems([
      input.year.branch,
      input.month.branch,
      input.day.branch,
      input.hour.branch,
    ]),
  ).analysis;
}

describe("dayMasterStrength evidence model", () => {
  it("月令帮身加权高于年支通根", () => {
    const monthRoot = analyze(
      pillars({
        year: ["庚", "申"],
        month: ["庚", "寅"],
        day: ["甲", "子"],
        hour: ["庚", "午"],
      }),
    );
    const yearRoot = analyze(
      pillars({
        year: ["庚", "寅"],
        month: ["庚", "申"],
        day: ["甲", "子"],
        hour: ["庚", "午"],
      }),
    );
    expect(monthRoot.strengthScore).toBeGreaterThan(yearRoot.strengthScore);
    expect(monthRoot.supportFactors.join("")).toContain("月令帮扶日主");
  });

  it("地支通根会提高日主强弱评分", () => {
    const withRoot = analyze(
      pillars({
        year: ["庚", "申"],
        month: ["丙", "午"],
        day: ["甲", "寅"],
        hour: ["戊", "辰"],
      }),
    );
    const withoutRoot = analyze(
      pillars({
        year: ["庚", "申"],
        month: ["丙", "午"],
        day: ["甲", "戌"],
        hour: ["戊", "丑"],
      }),
    );
    expect(withRoot.strengthScore).toBeGreaterThan(withoutRoot.strengthScore);
    expect(withRoot.supportFactors.join("")).toContain("日支寅");
  });

  it("官杀、财星、食伤分别作为克耗泄证据", () => {
    const result = analyze(
      pillars({
        year: ["庚", "申"],
        month: ["丙", "午"],
        day: ["甲", "子"],
        hour: ["戊", "辰"],
      }),
    );
    const weakening = result.weakeningFactors.join("；");
    expect(weakening).toContain("官杀克身");
    expect(weakening).toContain("食伤泄身");
    expect(weakening).toContain("财星耗身");
    expect(result.confidence).toBeGreaterThanOrEqual(55);
  });
});
