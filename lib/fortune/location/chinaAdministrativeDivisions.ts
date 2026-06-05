import { CITY_GEO_DATA } from "./cityGeoData";
import { computeElementBias } from "./regionElements";
import type { AdminType, ChinaCity, ChinaProvince, ChinaRegion } from "./types";

type ProvinceType = ChinaProvince["provinceType"];

const PROVINCE_META: Record<
  string,
  { provinceType: ProvinceType; shortName?: string; capital: string }
> = {
  北京市: { provinceType: "municipality", capital: "北京市" },
  天津市: { provinceType: "municipality", capital: "天津市" },
  上海市: { provinceType: "municipality", capital: "上海市" },
  重庆市: { provinceType: "municipality", capital: "重庆市" },
  河北省: { provinceType: "province", capital: "石家庄市" },
  山西省: { provinceType: "province", capital: "太原市" },
  辽宁省: { provinceType: "province", capital: "沈阳市" },
  吉林省: { provinceType: "province", capital: "长春市" },
  黑龙江省: { provinceType: "province", capital: "哈尔滨市" },
  江苏省: { provinceType: "province", capital: "南京市" },
  浙江省: { provinceType: "province", capital: "杭州市" },
  安徽省: { provinceType: "province", capital: "合肥市" },
  福建省: { provinceType: "province", capital: "福州市" },
  江西省: { provinceType: "province", capital: "南昌市" },
  山东省: { provinceType: "province", capital: "济南市" },
  河南省: { provinceType: "province", capital: "郑州市" },
  湖北省: { provinceType: "province", capital: "武汉市" },
  湖南省: { provinceType: "province", capital: "长沙市" },
  广东省: { provinceType: "province", capital: "广州市" },
  海南省: { provinceType: "province", capital: "海口市" },
  四川省: { provinceType: "province", capital: "成都市" },
  贵州省: { provinceType: "province", capital: "贵阳市" },
  云南省: { provinceType: "province", capital: "昆明市" },
  陕西省: { provinceType: "province", capital: "西安市" },
  甘肃省: { provinceType: "province", capital: "兰州市" },
  青海省: { provinceType: "province", capital: "西宁市" },
  台湾省: { provinceType: "taiwan", capital: "台北市" },
  内蒙古自治区: { provinceType: "autonomous_region", shortName: "内蒙古", capital: "呼和浩特市" },
  广西壮族自治区: { provinceType: "autonomous_region", shortName: "广西", capital: "南宁市" },
  西藏自治区: { provinceType: "autonomous_region", shortName: "西藏", capital: "拉萨市" },
  宁夏回族自治区: { provinceType: "autonomous_region", shortName: "宁夏", capital: "银川市" },
  新疆维吾尔自治区: { provinceType: "autonomous_region", shortName: "新疆", capital: "乌鲁木齐市" },
  香港特别行政区: { provinceType: "special_administrative_region", shortName: "香港", capital: "香港特别行政区" },
  澳门特别行政区: { provinceType: "special_administrative_region", shortName: "澳门", capital: "澳门特别行政区" },
};

function buildCity(
  province: string,
  city: string,
  geo: {
    latitude: number;
    longitude: number;
    adminType: AdminType;
    region: ChinaRegion;
    climateTags: string[];
  },
): ChinaCity {
  return {
    province,
    city,
    adminType: geo.adminType,
    latitude: Number(geo.latitude.toFixed(4)),
    longitude: Number(geo.longitude.toFixed(4)),
    timezone: "Asia/Shanghai",
    region: geo.region,
    climateTags: geo.climateTags,
    elementBias: computeElementBias(geo.region),
    notes: "坐标为地级行政区政府驻地或中心城区近似值",
  };
}

function buildChinaProvinces(): ChinaProvince[] {
  const grouped = new Map<string, ChinaCity[]>();

  for (const [key, geo] of Object.entries(CITY_GEO_DATA)) {
    const [province, city] = key.split("|");
    const list = grouped.get(province) ?? [];
    list.push(buildCity(province, city, geo));
    grouped.set(province, list);
  }

  const provinces: ChinaProvince[] = [];
  for (const [name, meta] of Object.entries(PROVINCE_META)) {
    const cities = (grouped.get(name) ?? []).sort((a, b) =>
      a.city.localeCompare(b.city, "zh-CN"),
    );
    provinces.push({
      name,
      shortName: meta.shortName,
      provinceType: meta.provinceType,
      cities,
    });
  }

  return provinces.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

export const CHINA_PROVINCES: ChinaProvince[] = buildChinaProvinces();

export const UNKNOWN_PROVINCE = "暂不确定";
export const UNKNOWN_CITY = "暂不确定";

export function getProvinceByName(name: string): ChinaProvince | undefined {
  return CHINA_PROVINCES.find((p) => p.name === name);
}

export function getCityEntry(
  province: string,
  city: string,
): ChinaCity | undefined {
  const p = getProvinceByName(province);
  return p?.cities.find((c) => c.city === city);
}

export function getProvinceCapital(province: string): ChinaCity | undefined {
  const meta = PROVINCE_META[province];
  if (!meta) return undefined;
  return getCityEntry(province, meta.capital);
}

export function listProvinceNames(): string[] {
  return CHINA_PROVINCES.map((p) => p.name);
}

export function listCityNames(province: string): string[] {
  return getProvinceByName(province)?.cities.map((c) => c.city) ?? [];
}
