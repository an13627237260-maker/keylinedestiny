"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisclaimerBanner } from "@/components/fortune/calculation-steps";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export default function ReportsPage() {
  const [dbReports, setDbReports] = useState<Record<string, unknown> | null>(null);
  const [localReports, setLocalReports] = useState<Array<{ key: string; data: Record<string, unknown> }>>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setDbReports)
      .catch(() => null);

    const items: Array<{ key: string; data: Record<string, unknown> }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("report-")) {
        try {
          items.push({
            key,
            data: JSON.parse(localStorage.getItem(key) ?? "{}"),
          });
        } catch {
          // skip
        }
      }
    }
    setLocalReports(items.reverse());
  }, []);

  const fortuneReports =
    (dbReports?.algorithm_result as { fortuneReports?: unknown[] })?.fortuneReports ?? [];

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-violet-200">历史报告</h1>
      <DisclaimerBanner text={DISCLAIMER} />

      <section className="mt-6">
        <h2 className="mb-3 text-lg text-violet-300">本地缓存</h2>
        {localReports.length === 0 ? (
          <p className="text-zinc-500">暂无本地报告</p>
        ) : (
          <div className="space-y-3">
            {localReports.map(({ key, data }) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{String(data.type)} · {key}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-zinc-500">
                  <pre className="max-h-40 overflow-auto">
                    {JSON.stringify(data.algorithm_result, null, 2)?.slice(0, 500)}...
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg text-violet-300">数据库记录</h2>
        {fortuneReports.length === 0 ? (
          <p className="text-zinc-500">暂无数据库报告（需运行 prisma migrate）</p>
        ) : (
          <div className="space-y-3">
            {(fortuneReports as Array<{ id: string; type: string; createdAt: string }>).map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle>{r.type}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-400">
                  {new Date(r.createdAt).toLocaleString()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
