import { describe, it, expect } from "vitest";
import {
  CHINA_PROVINCES,
  getCityEntry,
  getProvinceCapital,
} from "@/lib/fortune/location/chinaAdministrativeDivisions";

describe("CHINA_PROVINCES 完整数据", () => {
  it("包含 34 个省级行政区", () => {
    expect(CHINA_PROVINCES).toHaveLength(34);
  });

  it("每个省级行政区 cities.length > 0", () => {
    for (const p of CHINA_PROVINCES) {
      expect(p.cities.length).toBeGreaterThan(0);
    }
  });

  it("所有地级行政区都有经纬度", () => {
    for (const p of CHINA_PROVINCES) {
      for (const c of p.cities) {
        expect(c.latitude).toBeTypeOf("number");
        expect(c.longitude).toBeTypeOf("number");
        expect(c.elementBias).toBeDefined();
      }
    }
  });

  it("北京市包含北京市", () => {
    expect(getCityEntry("北京市", "北京市")).toBeDefined();
  });

  it("广东省包含广州深圳东莞中山", () => {
    for (const city of ["广州市", "深圳市", "东莞市", "中山市"]) {
      expect(getCityEntry("广东省", city)).toBeDefined();
    }
  });

  it("新疆包含乌鲁木齐、喀什、伊犁、石河子", () => {
    for (const city of [
      "乌鲁木齐市",
      "喀什地区",
      "伊犁哈萨克自治州",
      "石河子市",
    ]) {
      expect(getCityEntry("新疆维吾尔自治区", city)).toBeDefined();
    }
  });

  it("台湾省包含台北高雄台中", () => {
    for (const city of ["台北市", "高雄市", "台中市"]) {
      expect(getCityEntry("台湾省", city)).toBeDefined();
    }
  });

  it("港澳台行政区存在", () => {
    expect(getCityEntry("香港特别行政区", "香港特别行政区")).toBeDefined();
    expect(getCityEntry("澳门特别行政区", "澳门特别行政区")).toBeDefined();
  });

  it("北京经度接近 116.4074", () => {
    const bj = getCityEntry("北京市", "北京市")!;
    expect(bj.longitude).toBeCloseTo(116.4074, 2);
  });

  it("乌鲁木齐经度接近 87.6168", () => {
    const wlmq = getCityEntry("新疆维吾尔自治区", "乌鲁木齐市")!;
    expect(wlmq.longitude).toBeCloseTo(87.6168, 2);
  });

  it("重庆、石家庄、上海重点坐标准确", () => {
    const cq = getCityEntry("重庆市", "重庆市")!;
    const sjz = getCityEntry("河北省", "石家庄市")!;
    const sh = getCityEntry("上海市", "上海市")!;
    expect(cq.longitude).toBeCloseTo(106.5516, 2);
    expect(sjz.longitude).toBeCloseTo(114.5149, 2);
    expect(sh.longitude).toBeCloseTo(121.4737, 2);
  });

  it("所有城市坐标在中国合理范围内", () => {
    for (const p of CHINA_PROVINCES) {
      for (const c of p.cities) {
        expect(c.longitude, `${p.name}${c.city} longitude`).toBeGreaterThanOrEqual(73);
        expect(c.longitude, `${p.name}${c.city} longitude`).toBeLessThanOrEqual(135);
        expect(c.latitude, `${p.name}${c.city} latitude`).toBeGreaterThanOrEqual(18);
        expect(c.latitude, `${p.name}${c.city} latitude`).toBeLessThanOrEqual(54);
      }
    }
  });

  it("省会回退可用", () => {
    const cap = getProvinceCapital("四川省");
    expect(cap?.city).toBe("成都市");
  });
});
