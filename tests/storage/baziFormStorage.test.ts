import { beforeEach, describe, expect, it } from "vitest";
import {
  BAZI_LAST_INPUT_KEY,
  clearLastBaziInput,
  loadLastBaziInput,
  normalizeSavedBaziInput,
  saveLastBaziInput,
  type SavedBaziFormInput,
} from "@/lib/storage/baziFormStorage";

const INPUT: SavedBaziFormInput = {
  name: "测试",
  gender: "female",
  birthDate: "1990-05-15",
  birthTime: "10:30",
  province: "新疆维吾尔自治区",
  city: "乌鲁木齐市",
  birthPlace: "医院",
  latitude: 43.8256,
  longitude: 87.6168,
  timezone: "Asia/Shanghai",
  useTrueSolarTime: true,
  focusArea: "career",
  targetYear: 2026,
  dayBoundaryMode: "ziHour",
  savedAt: "2026-06-05T00:00:00.000Z",
  version: 1,
};

describe("baziFormStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存 lastInput 成功", () => {
    saveLastBaziInput(INPUT);
    expect(localStorage.getItem(BAZI_LAST_INPUT_KEY)).toContain("乌鲁木齐市");
  });

  it("读取 lastInput 成功", () => {
    saveLastBaziInput(INPUT);
    const loaded = loadLastBaziInput();
    expect(loaded?.birthDate).toBe(INPUT.birthDate);
    expect(loaded?.city).toBe("乌鲁木齐市");
    expect(loaded?.dayBoundaryMode).toBe("ziHour");
  });

  it("清除 lastInput 成功", () => {
    saveLastBaziInput(INPUT);
    clearLastBaziInput();
    expect(loadLastBaziInput()).toBeNull();
  });

  it("非法 birthDate 会被丢弃", () => {
    localStorage.setItem(BAZI_LAST_INPUT_KEY, JSON.stringify({ ...INPUT, birthDate: "2026-02-30" }));
    expect(loadLastBaziInput()).toBeNull();
  });

  it("旧版本缺失字段会补默认值", () => {
    const normalized = normalizeSavedBaziInput({
      birthDate: "1990-05-15",
      birthTime: "10:30",
    });
    expect(normalized?.gender).toBe("unknown");
    expect(normalized?.timezone).toBe("Asia/Shanghai");
    expect(normalized?.focusArea).toBe("overall");
    expect(normalized?.version).toBe(1);
  });

  it("省市、经纬度、真太阳时设置会被保存", () => {
    saveLastBaziInput(INPUT);
    const loaded = loadLastBaziInput();
    expect(loaded?.province).toBe("新疆维吾尔自治区");
    expect(loaded?.city).toBe("乌鲁木齐市");
    expect(loaded?.longitude).toBeCloseTo(87.6168);
    expect(loaded?.latitude).toBeCloseTo(43.8256);
    expect(loaded?.useTrueSolarTime).toBe(true);
  });

  it("focusArea 和 targetYear 会被保存", () => {
    saveLastBaziInput(INPUT);
    const loaded = loadLastBaziInput();
    expect(loaded?.focusArea).toBe("career");
    expect(loaded?.targetYear).toBe(2026);
  });
});
