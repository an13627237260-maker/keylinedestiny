import {
  DAY_PILLAR_BASE_INDEX,
  DAY_PILLAR_JDN_OFFSET,
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  YEAR_PILLAR_BASE_INDEX,
  YEAR_PILLAR_BASE_YEAR,
  type EarthlyBranch,
  type HeavenlyStem,
} from "./constants";

export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  index: number;
}

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function getSexagenary(index: number): Pillar {
  const normalized = mod(index, 60);
  return {
    index: normalized,
    stem: HEAVENLY_STEMS[normalized % 10],
    branch: EARTHLY_BRANCHES[normalized % 12],
  };
}

export function getYearPillarIndex(effectiveYear: number): number {
  return mod(effectiveYear - YEAR_PILLAR_BASE_YEAR + YEAR_PILLAR_BASE_INDEX, 60);
}

export function gregorianToJulianDayNumber(
  year: number,
  month: number,
  day: number,
): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524
  );
}

export function getDayPillarIndex(
  year: number,
  month: number,
  day: number,
): number {
  const jdn = gregorianToJulianDayNumber(year, month, day);
  return mod(jdn + DAY_PILLAR_JDN_OFFSET + DAY_PILLAR_BASE_INDEX, 60);
}

export function getStemIndex(stem: HeavenlyStem): number {
  return HEAVENLY_STEMS.indexOf(stem);
}

export function getBranchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

export function advanceStem(stem: HeavenlyStem, steps: number): HeavenlyStem {
  const idx = mod(getStemIndex(stem) + steps, 10);
  return HEAVENLY_STEMS[idx];
}

export function advanceBranch(
  branch: EarthlyBranch,
  steps: number,
): EarthlyBranch {
  const idx = mod(getBranchIndex(branch) + steps, 12);
  return EARTHLY_BRANCHES[idx];
}

export function pillarToString(pillar: Pillar): string {
  return `${pillar.stem}${pillar.branch}`;
}

export function isYangStem(stem: HeavenlyStem): boolean {
  return getStemIndex(stem) % 2 === 0;
}

export function isYangBranch(branch: EarthlyBranch): boolean {
  return getBranchIndex(branch) % 2 === 0;
}
