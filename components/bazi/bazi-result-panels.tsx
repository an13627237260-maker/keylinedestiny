"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import { LuckOverviewCard } from "@/components/luck/LuckOverviewCard";
import { BaziOverviewCard } from "./BaziOverviewCard";
import { LocationInfluenceCard } from "./LocationInfluenceCard";
import { CoreMetricsRow } from "./CoreMetricsRow";
import { ElementDistributionCard } from "./ElementDistributionCard";
import { DayMasterCard } from "./DayMasterCard";
import { TenGodsCard } from "./TenGodsCard";
import { RelationsCard } from "./RelationsCard";
import { SymbolicStarsCard } from "./SymbolicStarsCard";
import { LuckCycleCard } from "./LuckCycleCard";
import { YearlyLuckCard } from "./YearlyLuckCard";
import { PatternsCard } from "./PatternsCard";
import { BaziReportCard } from "./BaziReportCard";
import { CalculationStepsCard } from "./CalculationStepsCard";
import { DataSourceCard } from "./DataSourceCard";

export function BaziResultPanels({
  algo,
  report,
  calculationSteps,
  focusArea,
}: {
  algo: BaziAlgorithmResult;
  report: FortuneReport;
  calculationSteps: CalculationStep[];
  focusArea?: string;
}) {
  return (
    <motion.div
      className="space-y-4 md:space-y-5"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <LuckOverviewCard baziResult={algo} focusArea={focusArea} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <BaziOverviewCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <DataSourceCard steps={calculationSteps} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <LocationInfluenceCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <CoreMetricsRow algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <ElementDistributionCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <DayMasterCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <TenGodsCard algo={algo} focusArea={focusArea} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <RelationsCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <SymbolicStarsCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <PatternsCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <LuckCycleCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <YearlyLuckCard algo={algo} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <BaziReportCard report={report} />
      </motion.div>
      <motion.div variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}>
        <CalculationStepsCard steps={calculationSteps} />
      </motion.div>
    </motion.div>
  );
}
