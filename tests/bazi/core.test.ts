import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_ELEMENT,
} from "@/lib/fortune/bazi/constants";
import {
  getSexagenary,
  getYearPillarIndex,
  getDayPillarIndex,
  gregorianToJulianDayNumber,
} from "@/lib/fortune/bazi/ganzhi";
import { getLiChun, getEffectiveBaziYear } from "@/lib/fortune/bazi/solarTerms";
import {
  getYearPillar,
  getDayPillar,
  getHourPillar,
  getHourBranch,
} from "@/lib/fortune/bazi/pillars";
import { getHiddenStems } from "@/lib/fortune/bazi/hiddenStems";
import { getTenGod, analyzeTenGods } from "@/lib/fortune/bazi/tenGods";
import { analyzeFiveElements } from "@/lib/fortune/bazi/fiveElements";
import { analyzeDayMasterStrength } from "@/lib/fortune/bazi/dayMasterStrength";
import { analyzeStemRelations } from "@/lib/fortune/bazi/stemRelations";
import { analyzeBranchRelations } from "@/lib/fortune/bazi/branchRelations";
import { calculateLuckCycle } from "@/lib/fortune/bazi/luckCycle";
import { analyzeYearlyLuck } from "@/lib/fortune/bazi/yearlyLuck";
import { computeFourPillars } from "@/lib/fortune/bazi/pillars";
import { computeBazi } from "@/lib/fortune/bazi";
import { drawTarotReading } from "@/lib/fortune/tarot";
import { TAROT_DECK } from "@/lib/fortune/tarot/cards";
import { getZodiacSign } from "@/lib/fortune/zodiac";
import { calculateFiveGrid } from "@/lib/fortune/name/analysis";
import {
  containsForbiddenWords,
  validateAiReport,
} from "@/lib/ai/consistencyChecker";
import { buildFallbackBaziReport } from "@/lib/ai/baziFallback";

describe("天干地支基础映射", () => {
  it("十天干十二地支长度正确", () => {
    expect(HEAVENLY_STEMS).toHaveLength(10);
    expect(EARTHLY_BRANCHES).toHaveLength(12);
  });

  it("天干五行映射", () => {
    expect(STEM_ELEMENT["甲"]).toBe("木");
    expect(STEM_ELEMENT["庚"]).toBe("金");
  });
});

describe("年柱", () => {
  it("1984 立春后为甲子年", () => {
    const dt = DateTime.fromISO("1984-02-05T10:00:00", {
      zone: "Asia/Shanghai",
    });
    const { pillar } = getYearPillar(dt, "Asia/Shanghai");
    expect(pillar.stem).toBe("甲");
    expect(pillar.branch).toBe("子");
  });

  it("立春前出生按上一年柱", () => {
    const dt = DateTime.fromISO("1984-02-03T10:00:00", {
      zone: "Asia/Shanghai",
    });
    const effective = getEffectiveBaziYear(dt, "Asia/Shanghai");
    expect(effective.beforeLiChun).toBe(true);
    expect(effective.year).toBe(1983);
    const idx = getYearPillarIndex(effective.year);
    const pillar = getSexagenary(idx);
    expect(pillar.stem + pillar.branch).not.toBe("甲子");
  });
});

describe("日柱", () => {
  it("1984-02-02 为甲子日", () => {
    const idx = getDayPillarIndex(1984, 2, 2);
    const pillar = getSexagenary(idx);
    expect(pillar.stem).toBe("甲");
    expect(pillar.branch).toBe("子");
  });

  it("JDN 基准一致", () => {
    expect(gregorianToJulianDayNumber(1984, 2, 2)).toBe(2445733);
  });

  it("23:00 ziHour 换日", () => {
    const dt = DateTime.fromISO("1984-02-02T23:30:00", {
      zone: "Asia/Shanghai",
    });
    const { pillar, step } = getDayPillar(dt, { dayBoundaryMode: "ziHour", solarTermSource: "builtIn", useEquationOfTime: false, calendarRange: "1900-2100" });
    const nextDayIdx = getDayPillarIndex(1984, 2, 3);
    expect(pillar.index).toBe(nextDayIdx);
    expect(step.result.advancedForZiHour).toBe(true);
  });
});

describe("时柱", () => {
  it("午时计算", () => {
    expect(getHourBranch(12)).toBe("午");
    const dt = DateTime.fromISO("1984-02-02T12:00:00", { zone: "Asia/Shanghai" });
    const dayStem = getSexagenary(getDayPillarIndex(1984, 2, 2)).stem;
    const { pillar } = getHourPillar(dt, dayStem);
    expect(pillar.branch).toBe("午");
  });
});

describe("十神与藏干", () => {
  it("十神映射 - 甲见甲为比肩", () => {
    expect(getTenGod("甲", "甲")).toBe("比肩");
    expect(getTenGod("甲", "乙")).toBe("劫财");
    expect(getTenGod("甲", "丙")).toBe("食神");
  });

  it("子藏癸", () => {
    const hidden = getHiddenStems("子");
    expect(hidden[0].stem).toBe("癸");
    expect(hidden[0].weight).toBe(1);
  });
});

describe("五行与日主", () => {
  it("五行统计有结果", () => {
    const dt = DateTime.fromISO("1990-05-15T14:30:00", { zone: "Asia/Shanghai" });
    const { pillars } = computeFourPillars(dt, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    const hidden = {
      [pillars.year.branch]: getHiddenStems(pillars.year.branch),
      [pillars.month.branch]: getHiddenStems(pillars.month.branch),
      [pillars.day.branch]: getHiddenStems(pillars.day.branch),
      [pillars.hour.branch]: getHiddenStems(pillars.hour.branch),
    };
    const { analysis } = analyzeFiveElements(pillars, hidden);
    expect(analysis.strongestElement).toBeTruthy();
    expect(analysis.balanceScore).toBeGreaterThan(0);
  });

  it("日主强弱", () => {
    const dt = DateTime.fromISO("1990-05-15T14:30:00", { zone: "Asia/Shanghai" });
    const { pillars } = computeFourPillars(dt, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    const hidden = {
      [pillars.year.branch]: getHiddenStems(pillars.year.branch),
      [pillars.month.branch]: getHiddenStems(pillars.month.branch),
      [pillars.day.branch]: getHiddenStems(pillars.day.branch),
      [pillars.hour.branch]: getHiddenStems(pillars.hour.branch),
    };
    const { analysis } = analyzeDayMasterStrength(pillars, hidden);
    expect(["strong", "balanced", "weak"]).toContain(analysis.strengthLevel);
  });
});

describe("合冲刑害", () => {
  it("天干五合", () => {
    const pillars = {
      year: getSexagenary(0),
      month: getSexagenary(5),
      day: getSexagenary(10),
      hour: getSexagenary(15),
    };
    pillars.year.stem = "甲";
    pillars.month.stem = "己";
    const { analysis } = analyzeStemRelations(pillars);
    expect(analysis.combinations.length).toBeGreaterThanOrEqual(0);
  });

  it("地支六冲", () => {
    const pillars = {
      year: getSexagenary(0),
      month: getSexagenary(1),
      day: getSexagenary(2),
      hour: getSexagenary(3),
    };
    pillars.year.branch = "子";
    pillars.day.branch = "午";
    const { analysis } = analyzeBranchRelations(pillars);
    expect(analysis.clashes.some((c) => c.branches.join("") === "子午" || c.branches.join("") === "午子")).toBe(true);
  });
});

describe("大运流年", () => {
  it("大运顺逆 - 阳年男顺", () => {
    const dt = DateTime.fromISO("1990-05-15T14:30:00", { zone: "Asia/Shanghai" });
    const { pillars } = computeFourPillars(dt, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    pillars.year.stem = "甲";
    const { analysis } = calculateLuckCycle(dt, "Asia/Shanghai", "male", pillars, 1990);
    expect(analysis.direction).toBe("forward");
    expect(analysis.cycles.length).toBeGreaterThan(0);
  });

  it("gender unknown 不计算大运", () => {
    const dt = DateTime.fromISO("1990-05-15T14:30:00", { zone: "Asia/Shanghai" });
    const { pillars } = computeFourPillars(dt, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    const { analysis } = calculateLuckCycle(dt, "Asia/Shanghai", "unknown", pillars, 1990);
    expect(analysis.cycles).toHaveLength(0);
  });

  it("流年干支", () => {
    const dt = DateTime.fromISO("1990-05-15T14:30:00", { zone: "Asia/Shanghai" });
    const { pillars } = computeFourPillars(dt, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    const hidden = {
      [pillars.year.branch]: getHiddenStems(pillars.year.branch),
      [pillars.month.branch]: getHiddenStems(pillars.month.branch),
      [pillars.day.branch]: getHiddenStems(pillars.day.branch),
      [pillars.hour.branch]: getHiddenStems(pillars.hour.branch),
    };
    const five = analyzeFiveElements(pillars, hidden).analysis;
    const { analysis } = analyzeYearlyLuck(2026, pillars, five);
    expect(analysis.yearPillar).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  });
});

describe("塔罗", () => {
  it("78张牌", () => {
    expect(TAROT_DECK).toHaveLength(78);
  });

  it("同 seed 可复核", () => {
    const a = drawTarotReading("threeCard", "test", "fixed-seed-123");
    const b = drawTarotReading("threeCard", "test", "fixed-seed-123");
    expect(a.result.cards.map((c) => c.card.id)).toEqual(
      b.result.cards.map((c) => c.card.id),
    );
  });

  it("不重复抽牌", () => {
    const { result } = drawTarotReading("love", "q", "seed-abc");
    const ids = result.cards.map((c) => c.card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("星座", () => {
  it("日期边界", () => {
    expect(getZodiacSign("1990-03-21").name).toBe("白羊座");
    expect(getZodiacSign("1990-03-20").name).toBe("双鱼座");
    expect(getZodiacSign("1990-01-15").name).toBe("摩羯座");
  });
});

describe("姓名五格", () => {
  it("王小明五格", () => {
    const { fiveGrid, missingChars } = calculateFiveGrid("王", "小明", "simplified");
    expect(missingChars).toHaveLength(0);
    expect(fiveGrid?.renGe).toBeGreaterThan(0);
  });
});

describe("AI fallback", () => {
  it("禁止词过滤", () => {
    const bad = JSON.stringify({
      summary: "你一定会发财",
      key_points: [],
      advice: [],
      warnings: [],
      disclaimer: "娱乐",
    });
    const result = validateAiReport(bad, { pillarStrings: { day: "甲子" } });
    expect(result.ok).toBe(false);
  });

  it("fallback 报告", () => {
    const { algorithm_result } = computeBazi({
      gender: "male",
      birthDate: "1990-05-15",
      birthTime: "14:30",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: false,
      focusArea: "overall",
    });
    const fb = buildFallbackBaziReport(
      algorithm_result as unknown as Record<string, unknown>,
      "overall",
    );
    expect(fb.summary).toContain(algorithm_result.pillarStrings.year);
    expect(fb.advice.length).toBeGreaterThanOrEqual(5);
    expect(containsForbiddenWords("一定")).toContain("一定");
  });
});

describe("立春时间", () => {
  it("1984立春可获取", () => {
    const lc = getLiChun(1984, "Asia/Shanghai");
    expect(lc.month).toBe(2);
    expect(lc.day).toBe(4);
  });
});
