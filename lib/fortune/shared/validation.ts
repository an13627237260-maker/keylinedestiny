import { z } from "zod";
import { CALENDAR_MAX_YEAR, CALENDAR_MIN_YEAR } from "../shared/constants";

export const baziOptionsSchema = z.object({
  dayBoundaryMode: z.enum(["midnight", "ziHour"]).default("midnight"),
  solarTermSource: z.enum(["builtIn", "external"]).default("builtIn"),
  useEquationOfTime: z.boolean().default(false),
  calendarRange: z.string().default("1900-2100"),
  useOnlineSolarTermCalibration: z.boolean().default(false),
  useOnlineLocationCalibration: z.boolean().default(false),
  overseasLocationQuery: z.string().max(120).optional(),
  overseasCountry: z.string().max(80).optional(),
});

export const baziInputSchema = z
  .object({
    name: z.string().optional(),
    gender: z.enum(["male", "female", "unknown"]),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    birthTime: z.string().regex(/^\d{2}:\d{2}$/),
    province: z.string().optional(),
    city: z.string().optional(),
    birthPlace: z.string().optional(),
    birthPlaceNote: z.string().max(200).optional(),
    locationUnknown: z.boolean().optional(),
    longitude: z.number().min(-180).max(180).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    manualLongitude: z.number().min(-180).max(180).optional(),
    manualLatitude: z.number().min(-90).max(90).optional(),
    timezone: z.string().min(1),
    useTrueSolarTime: z.boolean().default(true),
    focusArea: z
      .enum(["overall", "career", "wealth", "relationship", "love", "health", "study", "family"])
      .default("overall"),
    targetYear: z.number().int().optional(),
    options: baziOptionsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const [y] = data.birthDate.split("-").map(Number);
    if (y < CALENDAR_MIN_YEAR || y > CALENDAR_MAX_YEAR) {
      ctx.addIssue({
        code: "custom",
        message: `出生年份必须在 ${CALENDAR_MIN_YEAR}-${CALENDAR_MAX_YEAR} 之间`,
        path: ["birthDate"],
      });
    }
  });

export type BaziInput = z.infer<typeof baziInputSchema>;
export type BaziOptions = z.infer<typeof baziOptionsSchema>;

export const tarotSpreadSchema = z.enum([
  "single",
  "threeCard",
  "love",
  "career",
  "yesNo",
]);

export const tarotInputSchema = z.object({
  question: z.string().max(500).optional(),
  spread: tarotSpreadSchema,
  seed: z.string().optional(),
});

export const zodiacInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  zodiacSign: z.string().optional(),
  period: z
    .enum(["day", "week", "month", "year", "daily", "weekly", "monthly"])
    .default("day"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const nameInputSchema = z.object({
  name: z.string().min(1).max(20),
  script: z
    .enum(["simplified", "traditional", "kangxi"])
    .default("simplified"),
  gender: z.enum(["male", "female", "unknown"]).default("unknown"),
});

export const loveInputSchema = z.object({
  personA: baziInputSchema,
  personB: baziInputSchema,
});
