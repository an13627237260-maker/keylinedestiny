import type { FortuneType } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

const STORAGE_KEY = "fortune-mingli-reports";

export interface StoredReport {
  id: string;
  type: FortuneType;
  createdAt: string;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
}

function readAll(): StoredReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredReport[];
  } catch {
    return [];
  }
}

function writeAll(reports: StoredReport[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function saveReport(
  type: FortuneType,
  data: {
    report: FortuneReport;
    input?: unknown;
    algorithm_result?: unknown;
    calculation_steps?: unknown;
    rule_results?: unknown;
    warnings?: string[];
  },
): StoredReport {
  const entry: StoredReport = {
    id: `${type}-${Date.now()}`,
    type,
    createdAt: new Date().toISOString(),
    title: data.report.title,
    summary: data.report.summary,
    payload: data as unknown as Record<string, unknown>,
  };
  const all = readAll();
  all.unshift(entry);
  writeAll(all.slice(0, 100));
  return entry;
}

export function listReports(type?: FortuneType): StoredReport[] {
  const all = readAll();
  return type ? all.filter((r) => r.type === type) : all;
}

export function deleteReport(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id));
}

export function clearReports(type?: FortuneType): void {
  if (!type) {
    writeAll([]);
    return;
  }
  writeAll(readAll().filter((r) => r.type !== type));
}

export function getReport(id: string): StoredReport | undefined {
  return readAll().find((r) => r.id === id);
}
