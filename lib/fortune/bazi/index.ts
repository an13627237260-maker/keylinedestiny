import { DateTime } from "luxon";
import { DISCLAIMER } from "../shared/constants";
import type { CalculationStep } from "../shared/types";
import { parseBirthDateTime, validateTimezone } from "../shared/time";
import type { BaziInput } from "../shared/validation";
import { baziOptionsSchema } from "../shared/validation";
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
  luckCycle: ReturnType<typeof calculateLuckCycle>["analysis"];
  yearlyLuck?: ReturnType<typeof analyzeYearlyLuck>["analysis"];
}

export function computeBazi(input: BaziInput): {
  algorithm_result: BaziAlgorithmResult;
  calculation_steps: CalculationStep[];
  warnings: string[];
} {
  validateTimezone(input.timezone);
  const options = baziOptionsSchema.parse(input.options ?? {});

  let dateTime = parseBirthDateTime(
    input.birthDate,
    input.birthTime,
    input.timezone,
  );

  const steps: CalculationStep[] = [];
  const warnings: string[] = [SOLAR_TERM_ACCURACY_NOTE];

  if (input.useTrueSolarTime && input.longitude !== undefined) {
    const tst = calculateTrueSolarTime(
      dateTime,
      input.timezone,
      input.longitude,
      options.useEquationOfTime,
    );
    dateTime = tst.adjustedDateTime;
    steps.push(buildTrueSolarTimeStep(tst));
  }

  steps.push(buildSolarTermStep(dateTime.year, input.timezone, dateTime));
  warnings.push(...checkSolarTermProximityWarnings(dateTime, input.timezone));

  const { pillars, steps: pillarSteps } = computeFourPillars(
    dateTime,
    input.timezone,
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
    input.timezone,
    input.gender,
    pillars,
    dateTime.year,
  );
  steps.push(luckCycleResult.step);
  warnings.push(...luckCycleResult.analysis.warnings);

  let yearlyLuckAnalysis;
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
    luckCycle: luckCycleResult.analysis,
    yearlyLuck: yearlyLuckAnalysis,
  };

  return {
    algorithm_result,
    calculation_steps: steps,
    warnings,
  };
}

export { DISCLAIMER };
