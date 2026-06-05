import { describe, it, expect } from "vitest";
import { resolveBirthLocation } from "@/lib/fortune/location/locationResolver";

describe("resolveBirthLocation", () => {
  it("province + city 使用城市经纬度", () => {
    const r = resolveBirthLocation({
      province: "北京市",
      city: "北京市",
    });
    expect(r.locationConfidence).toBe("exact_city");
    expect(r.longitude).toBeCloseTo(116.4074, 2);
    expect(r.timezone).toBe("Asia/Shanghai");
  });

  it("只选省份时使用省会", () => {
    const r = resolveBirthLocation({ province: "四川省" });
    expect(r.locationConfidence).toBe("province_capital");
    expect(r.city).toBe("成都市");
    expect(r.notes.some((n) => n.includes("省会"))).toBe(true);
  });

  it("手动经纬度优先", () => {
    const r = resolveBirthLocation({
      province: "北京市",
      city: "北京市",
      manualLongitude: 100.5,
      manualLatitude: 30.2,
    });
    expect(r.locationConfidence).toBe("manual");
    expect(r.longitude).toBe(100.5);
    expect(r.latitude).toBe(30.2);
  });

  it("unknown 不返回经纬度", () => {
    const r = resolveBirthLocation({ locationUnknown: true });
    expect(r.locationConfidence).toBe("unknown");
    expect(r.longitude).toBeUndefined();
    expect(r.notes.some((n) => n.includes("真太阳时"))).toBe(true);
  });
});
