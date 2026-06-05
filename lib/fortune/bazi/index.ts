import { DISCLAIMER } from "../shared/constants";
import type { CalculationStep } from "../shared/types";
import { parseBirthDateTime, validateTimezone } from "../shared/time";
import type { BaziInput } from "../shared/validation";
import { baziOptionsSchema } from "../shared/validation";
import {
  buildLocationResolvedStep,
  buildRegionElementNote,
  resolveBirthLocation,
} from "../location/locationResolver";
import type { LocationInfluence } from "../location/types";
import { analyzeBranchRelations } from "./branchRelations";
import { analyzeDayMasterStrength } from "./dayMasterStrength";
import { analyzeFiveElements } from "./fiveElements";
import { getAllHiddenStems, buildHiddenStemsStep } from "./hiddenStems";
import { calculateLuckCycle } from "./luckCycle";
import { computeFourPillars } from "./pillars";
import { pillarToString } from "./ganzhi";
import {
  buildSolarTermStep,
  checkSolarTermProximityWarnings,
  SOLAR_TERM_ACCURACY_NOTE,
} from "./solarTerms";
import { analyzeStemRelations } from "./stemRelations";
import { analyzeSymbolicStars } from "./symbolicStars";
import { analyzeTenGods } from "./tenGods";
import { calculateTrueSolarTime, buildTrueSolarTimeStep } from "./trueSolarTime";
import { analyzeYearlyLuck } from "./yearlyLuck";
import { analyzeTwelveGrowthStages } from "./twelveGrowthStages";
import { analyzeNayin } from "./nayin";
import { analyzePatterns } from "./patterns";
import { analyzeUsefulGods } from "./usefulGods";
import { analyzeMonthlyLuck } from "./monthlyLuck";

export interface BaziAlgorithmResult {
  pillars: ReturnType<typeof computeFourPillars>["pillars"];
  pillarStrings: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  effectiveDateTime: string;
  tenGods: ReturnType<typeof analyzeTenGods>["analysis"];
  fiveElements: ReturnType<typeof analyzeFiveElements>["analysis"];
  dayMasterStrength: ReturnType<typeof analyzeDayMasterStrength>["analysis"];
  stemRelations: ReturnType<typeof analyzeStemRelations>["analysis"];
  branchRelations: ReturnType<typeof analyzeBranchRelations>["analysis"];
  symbolicStars: ReturnType<typeof analyzeSymbolicStars>["stars"];
  twelveGrowthStages: ReturnType<typeof analyzeTwelveGrowthStages>["stages"];
  nayin: ReturnType<typeof analyzeNayin>["nayin"];
  patternTendencies: ReturnType<typeof analyzePatterns>["tendencies"];
  usefulGods: ReturnType<typeof analyzeUsefulGods>["analysis"];
  luckCycle: ReturnType<typeof calculateLuckCycle>["analysis"];
  yearlyLuck?: ReturnType<typeof analyzeYearlyLuck>["analysis"];
  monthlyLuck?: ReturnType<typeof analyzeMonthlyLuck>["months"];
  locationInfluence?: LocationInfluence;
}

export function computeBazi(input: BaziInput): {
  algorithm_result: BaziAlgorithmResult;
  calculation_steps: CalculationStep[];
  warnings: string[];
} {
  validateTimezone(input.timezone);
  const options = baziOptionsSchema.parse(input.options ?? {});

  const resolved = resolveBirthLocation({
    province: input.province,
    city: input.city,
    birthPlace: input.birthPlace,
    birthPlaceNote: input.birthPlaceNote,
    locationUnknown: input.locationUnknown,
    longitude: input.longitude,
    latitude: input.latitude,
    manualLongitude: input.manualLongitude,
    manualLatitude: input.manualLatitude,
  });

  const timezone = resolved.timezone || input.timezone;
  validateTimezone(timezone);

  const steps: CalculationStep[] = [buildLocationResolvedStep(resolved)];
  const warnings: string[] = [SOLAR_TERM_ACCURACY_NOTE];

  let dateTime = parseBirthDateTime(input.birthDate, input.birthTime, timezone);
  const originalDateTimeIso = dateTime.toISO() ?? "";

  const useTrueSolarTime =
    input.useTrueSolarTime &&
    resolved.locationConfidence !== "unknown" &&
    resolved.longitude !== undefined;

  if (input.useTrueSolarTime && resolved.longitude === undefined) {
    warnings.push("已勾选真太阳时，但未获得出生地经度，已按北京时间计算。");
  }

  let hourPillarChanged = false;
  let dayPillarChanged = false;
  let pillarsBeforeCorrection:
    | { year: string; month: string; day: string; hour: string }
    | undefined;
  let correctionMinutes: number | undefined;
  let standardLongitude: number | undefined;

  if (useTrueSolarTime && resolved.longitude !== undefined) {
    const reference = computeFourPillars(dateTime, timezone, options);
    pillarsBeforeCorrection = {
      year: pillarToString(reference.pillars.year),
      month: pillarToString(reference.pillars.month),
      day: pillarToString(reference.pillars.day),
      hour: pillarToString(reference.pillars.hour),
    };

    const tst = calculateTrueSolarTime(
      dateTime,
      timezone,
      resolved.longitude,
      options.useEquationOfTime,
    );
    correctionMinutes = tst.correctionMinutes;
    standardLongitude = tst.standardLongitude;
    dateTime = tst.adjustedDateTime;

    const adjusted = computeFourPillars(dateTime, timezone, options);
    hourPillarChanged =
      pillarToString(reference.pillars.hour) !==
      pillarToString(adjusted.pillars.hour);
    dayPillarChanged =
      pillarToString(reference.pillars.day) !==
      pillarToString(adjusted.pillars.day);

    steps.push(
      buildTrueSolarTimeStep(tst, { hourPillarChanged, dayPillarChanged }),
    );
  } else if (resolved.locationConfidence === "unknown") {
    warnings.push("出生地未确定，未使用真太阳时修正。");
  }

  steps.push(buildSolarTermStep(dateTime.year, timezone, dateTime));
  warnings.push(...checkSolarTermProximityWarnings(dateTime, timezone));

  const { pillars, steps: pillarSteps } = computeFourPillars(
    dateTime,
    timezone,
    options,
  );
  steps.push(...pillarSteps);

  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];
  const hiddenStems = getAllHiddenStems(branches);
  steps.push(buildHiddenStemsStep(branches));

  const tenGodsResult = analyzeTenGods(pillars, hiddenStems);
  steps.push(tenGodsResult.step);

  const fiveElementsResult = analyzeFiveElements(pillars, hiddenStems);
  steps.push(fiveElementsResult.step);

  const dayMasterResult = analyzeDayMasterStrength(pillars, hiddenStems);
  steps.push(dayMasterResult.step);

  const stemRelationsResult = analyzeStemRelations(pillars);
  steps.push(stemRelationsResult.step);

  const branchRelationsResult = analyzeBranchRelations(pillars);
  steps.push(branchRelationsResult.step);

  const symbolicStarsResult = analyzeSymbolicStars(pillars);
  steps.push(symbolicStarsResult.step);

  const luckCycleResult = calculateLuckCycle(
    dateTime,
    timezone,
    input.gender,
    pillars,
    dateTime.year,
  );
  steps.push(luckCycleResult.step);
  warnings.push(...luckCycleResult.analysis.warnings);

  const growthResult = analyzeTwelveGrowthStages(pillars);
  steps.push(growthResult.step);

  const nayinResult = analyzeNayin(pillars);
  steps.push(nayinResult.step);

  let yearlyLuckAnalysis;
  let monthlyLuckAnalysis;
  const targetYear = input.targetYear ?? dateTime.year;
  if (input.targetYear) {
    const yearlyResult = analyzeYearlyLuck(
      input.targetYear,
      pillars,
      fiveElementsResult.analysis,
      luckCycleResult.analysis,
      input.focusArea,
    );
    steps.push(yearlyResult.step);
    yearlyLuckAnalysis = yearlyResult.analysis;
  }

  const monthlyResult = analyzeMonthlyLuck(
    targetYear,
    pillars,
    input.focusArea,
  );
  steps.push(monthlyResult.step);
  monthlyLuckAnalysis = monthlyResult.months;

  const locationInfluence: LocationInfluence = {
    resolved,
    originalDateTime: originalDateTimeIso,
    adjustedDateTime: dateTime.toISO() ?? "",
    correctionMinutes,
    standardLongitude,
    useTrueSolarTime,
    hourPillarChanged,
    dayPillarChanged,
    pillarsBeforeCorrection,
    regionElementNote: buildRegionElementNote(resolved.elementBias),
  };

  const partialAlgo = {
    pillars,
    pillarStrings: {
      year: pillarToString(pillars.year),
      month: pillarToString(pillars.month),
      day: pillarToString(pillars.day),
      hour: pillarToString(pillars.hour),
    },
    effectiveDateTime: dateTime.toISO() ?? "",
    tenGods: tenGodsResult.analysis,
    fiveElements: fiveElementsResult.analysis,
    dayMasterStrength: dayMasterResult.analysis,
    stemRelations: stemRelationsResult.analysis,
    branchRelations: branchRelationsResult.analysis,
    symbolicStars: symbolicStarsResult.stars,
    twelveGrowthStages: growthResult.stages,
    nayin: nayinResult.nayin,
    luckCycle: luckCycleResult.analysis,
    yearlyLuck: yearlyLuckAnalysis,
    monthlyLuck: monthlyLuckAnalysis,
    locationInfluence,
  } as BaziAlgorithmResult;

  const patternsResult = analyzePatterns(partialAlgo);
  steps.push(patternsResult.step);

  const usefulGodsResult = analyzeUsefulGods(partialAlgo);
  steps.push(usefulGodsResult.step);

  const algorithm_result: BaziAlgorithmResult = {
    pillars,
    pillarStrings: {
      year: pillarToString(pillars.year),
      month: pillarToString(pillars.month),
      day: pillarToString(pillars.day),
      hour: pillarToString(pillars.hour),
    },
    effectiveDateTime: dateTime.toISO() ?? "",
    tenGods: tenGodsResult.analysis,
    fiveElements: fiveElementsResult.analysis,
    dayMasterStrength: dayMasterResult.analysis,
    stemRelations: stemRelationsResult.analysis,
    branchRelations: branchRelationsResult.analysis,
    symbolicStars: symbolicStarsResult.stars,
    twelveGrowthStages: growthResult.stages,
    nayin: nayinResult.nayin,
    patternTendencies: patternsResult.tendencies,
    usefulGods: usefulGodsResult.analysis,
    luckCycle: luckCycleResult.analysis,
    yearlyLuck: yearlyLuckAnalysis,
    monthlyLuck: monthlyLuckAnalysis,
    locationInfluence,
  };

  return {
    algorithm_result,
    calculation_steps: steps,
    warnings,
  };
}

export { DISCLAIMER };
