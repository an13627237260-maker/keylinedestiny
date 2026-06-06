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
import type { BaziCalibrationContext } from "./calibratedDataSource";
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
import { evaluateClimateAdjustment } from "./climateAdjustment";
import { analyzeSpousePalace } from "./spousePalace";
import { analyzeHealthTendency } from "./healthTendency";
import { analyzeDomainAnalyses } from "./domainAnalyses";

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
  climate: ReturnType<typeof evaluateClimateAdjustment>;
  spousePalace: ReturnType<typeof analyzeSpousePalace>;
  healthTendency: ReturnType<typeof analyzeHealthTendency>;
  careerAnalysis: ReturnType<typeof analyzeDomainAnalyses>["career"];
  wealthAnalysis: ReturnType<typeof analyzeDomainAnalyses>["wealth"];
  familyAnalysis: ReturnType<typeof analyzeDomainAnalyses>["family"];
  luckCycle: ReturnType<typeof calculateLuckCycle>["analysis"];
  yearlyLuck?: ReturnType<typeof analyzeYearlyLuck>["analysis"];
  monthlyLuck?: ReturnType<typeof analyzeMonthlyLuck>["months"];
  locationInfluence?: LocationInfluence;
}

export function computeBazi(input: BaziInput): {
  algorithm_result: BaziAlgorithmResult;
  calculation_steps: CalculationStep[];
  warnings: string[];
};
export function computeBazi(
  input: BaziInput,
  calibration: BaziCalibrationContext,
): {
  algorithm_result: BaziAlgorithmResult;
  calculation_steps: CalculationStep[];
  warnings: string[];
};
export function computeBazi(
  input: BaziInput,
  calibration?: BaziCalibrationContext,
): {
  algorithm_result: BaziAlgorithmResult;
  calculation_steps: CalculationStep[];
  warnings: string[];
} {
  validateTimezone(input.timezone);
  const options = baziOptionsSchema.parse(input.options ?? {});

  let resolved = resolveBirthLocation({
    province: input.province,
    city: input.city,
    birthPlace: input.birthPlace,
    birthPlaceNote: input.birthPlaceNote,
    locationUnknown: input.locationUnknown,
    longitude: input.longitude,
    latitude: input.latitude,
    manualLongitude: input.manualLongitude,
    manualLatitude: input.manualLatitude,
    timezone: input.timezone,
  }, calibration?.location);

  const timezone = calibration?.timezone?.data.timezone || resolved.timezone || input.timezone;
  validateTimezone(timezone);
  resolved = { ...resolved, timezone };

  const steps: CalculationStep[] = [
    ...(calibration?.calculationSteps ?? []),
    buildLocationResolvedStep(resolved),
  ];
  const warnings: string[] = [
    ...(calibration?.warnings ?? []),
    ...(calibration?.solarTerms?.meta.sourceType === "online_verified"
      ? []
      : [SOLAR_TERM_ACCURACY_NOTE]),
  ];

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
    const reference = computeFourPillars(
      dateTime,
      timezone,
      options,
      calibration?.solarTermContext,
    );
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
      {
        utcOffsetMinutes: calibration?.timezone?.data.utcOffsetMinutes,
        longitudeSource: resolved.dataSource,
        timezoneSource: calibration?.timezone?.meta,
      },
    );
    correctionMinutes = tst.correctionMinutes;
    standardLongitude = tst.standardLongitude;
    dateTime = tst.adjustedDateTime;

    const adjusted = computeFourPillars(
      dateTime,
      timezone,
      options,
      calibration?.solarTermContext,
    );
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

  steps.push(
    buildSolarTermStep(
      dateTime.year,
      timezone,
      dateTime,
      calibration?.solarTermContext,
      calibration?.solarTerms,
    ),
  );
  warnings.push(
    ...checkSolarTermProximityWarnings(
      dateTime,
      timezone,
      calibration?.solarTermContext,
    ),
  );

  const { pillars, steps: pillarSteps } = computeFourPillars(
    dateTime,
    timezone,
    options,
    calibration?.solarTermContext,
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

  const climateAnalysis = evaluateClimateAdjustment({
    pillars,
    elementDistribution: fiveElementsResult.analysis,
    dayMasterStrength: dayMasterResult.analysis,
  });
  steps.push({
    step: "climate_adjustment",
    title: "调候分析",
    input: {
      dayMaster: pillars.day.stem,
      monthBranch: pillars.month.branch,
    },
    method: "依据月令寒热燥湿、日主五行与五行分布判断调候倾向",
    result: climateAnalysis as unknown as Record<string, unknown>,
    notes: [...climateAnalysis.reasoning, climateAnalysis.caution],
  });

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
    timezone,
    calibration?.solarTermContext,
  );
  steps.push(monthlyResult.step);
  monthlyLuckAnalysis = monthlyResult.months;

  const currentLuckForTarget = luckCycleResult.analysis.cycles.find(
    (cycle) => targetYear >= cycle.startYear && targetYear <= cycle.endYear,
  );

  const spousePalaceAnalysis = analyzeSpousePalace({
    input,
    pillars,
    tenGods: tenGodsResult.analysis,
    branchRelations: branchRelationsResult.analysis,
    currentLuck: currentLuckForTarget ?? luckCycleResult.analysis.currentCycle,
    annualLuck: yearlyLuckAnalysis,
  });
  steps.push({
    step: "spouse_palace",
    title: "夫妻宫与感情关系",
    input: {
      gender: input.gender,
      spousePalace: pillars.day.branch,
      targetYear,
    },
    method: "以日支为夫妻宫；女命官杀、男命财星为伴侣星；结合合冲刑害破与大运流年引动",
    result: spousePalaceAnalysis as unknown as Record<string, unknown>,
    notes: spousePalaceAnalysis.cautions,
  });

  const healthTendency = analyzeHealthTendency({
    pillars,
    elementDistribution: fiveElementsResult.analysis,
    climate: climateAnalysis,
    branchRelations: branchRelationsResult.analysis,
  });
  steps.push({
    step: "health_tendency",
    title: "健康倾向",
    input: {
      strongestElement: fiveElementsResult.analysis.strongestElement,
      climateType: climateAnalysis.climateType,
    },
    method: "依据五行偏旺偏弱、调候寒热燥湿与冲刑害破输出命理象意健康倾向",
    result: healthTendency as unknown as Record<string, unknown>,
    notes: [healthTendency.disclaimer],
  });

  const domainAnalyses = analyzeDomainAnalyses({
    pillars,
    tenGods: tenGodsResult.analysis,
    dayMasterStrength: dayMasterResult.analysis,
    fiveElements: fiveElementsResult.analysis,
    branchRelations: branchRelationsResult.analysis,
    currentLuck: currentLuckForTarget ?? luckCycleResult.analysis.currentCycle,
    annualLuck: yearlyLuckAnalysis,
  });
  steps.push({
    step: "domain_analyses",
    title: "事业财运家庭分析",
    input: {
      targetYear,
      dayMasterStrength: dayMasterResult.analysis.strengthLevel,
    },
    method: "分别以官杀印食伤财星、财星透根与年/月柱家庭宫位建立证据链",
    result: domainAnalyses as unknown as Record<string, unknown>,
    notes: [
      domainAnalyses.career.caution,
      domainAnalyses.wealth.caution,
      domainAnalyses.family.caution,
    ],
  });

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
    climate: climateAnalysis,
    spousePalace: spousePalaceAnalysis,
    healthTendency,
    careerAnalysis: domainAnalyses.career,
    wealthAnalysis: domainAnalyses.wealth,
    familyAnalysis: domainAnalyses.family,
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
    climate: climateAnalysis,
    spousePalace: spousePalaceAnalysis,
    healthTendency,
    careerAnalysis: domainAnalyses.career,
    wealthAnalysis: domainAnalyses.wealth,
    familyAnalysis: domainAnalyses.family,
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
