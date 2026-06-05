import Link from "next/link";
import { PageShell } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisclaimerBanner } from "@/components/fortune/calculation-steps";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

const features = [
  {
    href: "/bazi",
    title: "生辰八字",
    desc: "四柱、五行、十神、大运流年，计算过程可复核",
  },
  {
    href: "/tarot",
    title: "塔罗抽牌",
    desc: "78张完整牌组，多种牌阵，seed 可追溯",
  },
  {
    href: "/zodiac",
    title: "星座分析",
    desc: "星座特质与确定性运势趋势",
  },
  {
    href: "/name",
    title: "姓名分析",
    desc: "五格剖象法简化模型",
  },
  {
    href: "/love",
    title: "情感合盘",
    desc: "双人八字与星座辅助分析",
  },
  {
    href: "/reports",
    title: "历史报告",
    desc: "查看已保存的测算记录",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">
          命理测算
        </h1>
        <p className="text-zinc-400">
          传统规则计算 + AI 解读 · 算法优先 · 过程透明
        </p>
      </div>

      <div className="mb-8">
        <DisclaimerBanner text={DISCLAIMER} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href}>
            <Card className="h-full transition hover:border-violet-500/50 hover:bg-violet-500/5">
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400">{f.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
