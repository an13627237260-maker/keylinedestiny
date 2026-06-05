import { z } from "zod";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export const aiReportSchema = z.object({
  summary: z.string(),
  key_points: z.array(z.string()),
  personality: z.string().optional(),
  love: z.string().optional(),
  career: z.string().optional(),
  wealth: z.string().optional(),
  study: z.string().optional(),
  health: z.string().optional(),
  timing: z.string().optional(),
  advice: z.array(z.string()),
  warnings: z.array(z.string()),
  disclaimer: z.string().default(DISCLAIMER),
});

export type AiReport = z.infer<typeof aiReportSchema>;
