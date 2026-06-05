"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  Star,
  PenLine,
  Heart,
  History,
  Shield,
  Eye,
  FileCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { PillBadge } from "@/components/ui/pill-badge";
import { DisclaimerBanner } from "@/components/fortune/calculation-steps";
import { ELEMENT_COLORS } from "@/lib/theme";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";
import { fadeUp } from "@/lib/motion";

const features = [
  { href: "/bazi", icon: Sparkles, title: "生辰八字", desc: "四柱、五行、十神、大运流年", tag: "核心" },
  { href: "/tarot", icon: Layers, title: "塔罗抽牌", desc: "78 张牌组 · 多种牌阵", tag: "神秘" },
  { href: "/zodiac", icon: Star, title: "星座运势", desc: "确定性趋势 · 稳定输出", tag: "星象" },
  { href: "/name", icon: PenLine, title: "姓名分析", desc: "五格剖象简化模型", tag: "东方" },
  { href: "/love", icon: Heart, title: "情感合盘", desc: "双人八字与星座辅助", tag: "合盘" },
  { href: "/reports", icon: History, title: "历史报告", desc: "本地保存 · 随时回看", tag: "记录" },
];

const pillars = [
  { label: "年柱", stem: "甲", branch: "子" },
  { label: "月柱", stem: "丙", branch: "寅" },
  { label: "日柱", stem: "戊", branch: "辰", day: true },
  { label: "时柱", stem: "庚", branch: "午" },
];

export default function HomePage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="grid items-center gap-6 py-4 sm:gap-8 sm:py-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <motion.div {...fadeUp} className="order-1">
          <PillBadge variant="gold" className="mb-3">
            传统命理 · 规则引擎 · 可复核排盘
          </PillBadge>
          <h1 className="font-display text-3xl font-bold leading-tight text-[var(--text-main)] sm:text-4xl lg:text-5xl">
            看见命盘里的
            <span className="text-[var(--gold-main)]">结构与趋势</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            基于八字、五行、十神、大运与流年的本地规则引擎，生成稳定、可复核的命理分析。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/bazi" className="w-full sm:w-auto">
              <MysticButton variant="primary" className="w-full sm:w-auto">
                立即测算八字
              </MysticButton>
            </Link>
            <Link href="/tarot" className="w-full sm:w-auto">
              <MysticButton variant="secondary" className="w-full sm:w-auto">
                查看塔罗指引
              </MysticButton>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative order-2 mx-auto w-full max-w-md"
        >
          <div
            className="absolute inset-0 m-auto h-48 w-48 rounded-full opacity-10 sm:h-64 sm:w-64 sm:opacity-20"
            style={{
              background: "conic-gradient(var(--gold-main), var(--purple-primary), var(--gold-main))",
              animation: "wheel-spin 90s linear infinite",
            }}
          />
          <MysticCard highlighted className="relative">
            <p className="mb-3 text-center text-xs tracking-widest text-[var(--text-dim)]">
              命盘预览
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pillars.map((p) => (
                <div
                  key={p.label}
                  className={`rounded-lg border py-2.5 text-center sm:py-3 ${
                    p.day
                      ? "border-[var(--gold-main)]/50 bg-[rgba(214,181,109,0.08)]"
                      : "border-[var(--border-purple)]"
                  }`}
                >
                  <p className="text-[9px] text-[var(--text-dim)]">{p.label}</p>
                  <p className="font-display text-base text-[var(--gold-soft)] sm:text-lg">{p.stem}</p>
                  <p className="font-display text-base text-[var(--purple-soft)] sm:text-lg">{p.branch}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-2">
              {Object.entries(ELEMENT_COLORS).map(([el]) => (
                <div key={el} className="flex flex-col items-center gap-1">
                  <div
                    className="w-2 rounded-full"
                    style={{
                      background: `linear-gradient(to top, ${ELEMENT_COLORS[el]}, transparent)`,
                      height: `${[36, 24, 40, 28, 26][Object.keys(ELEMENT_COLORS).indexOf(el)] ?? 28}px`,
                    }}
                  />
                  <span className="text-[10px] text-[var(--text-dim)]">{el}</span>
                </div>
              ))}
            </div>
          </MysticCard>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-6 sm:py-12">
        <SectionTitle eyebrow="功能入口" title="探索命理维度" centered />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={f.href}>
                <MysticCard className="h-full transition-shadow hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-purple)] bg-[rgba(139,92,246,0.08)] sm:h-10 sm:w-10">
                      <f.icon className="h-4 w-4 text-[var(--gold-main)] sm:h-5 sm:w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-display text-sm font-semibold text-[var(--text-main)] sm:text-base">
                          {f.title}
                        </h3>
                        <PillBadge variant="muted" className="hidden sm:inline-flex">
                          {f.tag}
                        </PillBadge>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)] sm:text-sm">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </MysticCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="py-6 sm:py-12">
        <SectionTitle eyebrow="为什么选择" title="稳定 · 透明 · 可复核" centered />
        <div className="mt-6 grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: "纯规则引擎", desc: "本地传统命理算法，报告稳定一致" },
            { icon: Eye, title: "计算可复核", desc: "每一步推导可展开查看，过程透明" },
            { icon: FileCheck, title: "结构化报告", desc: "命盘、五行、十神、大运分章呈现" },
          ].map((item) => (
            <MysticCard key={item.title}>
              <item.icon className="mb-2 h-5 w-5 text-[var(--gold-main)] sm:mb-3 sm:h-6 sm:w-6" />
              <h3 className="font-display text-sm font-semibold text-[var(--text-main)] sm:text-base">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)] sm:mt-2 sm:text-sm">{item.desc}</p>
            </MysticCard>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section className="py-6 sm:py-12">
        <SectionTitle eyebrow="使用流程" title="三步完成排盘" centered />
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:items-center md:flex-row md:justify-center md:gap-8">
          {["输入出生信息", "生成命盘结构", "查看报告与建议"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 sm:gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold-main)]/40 font-display text-[var(--gold-main)]">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--text-muted)]">{step}</span>
              {i < 2 && <span className="hidden text-[var(--text-dim)] md:inline">→</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="py-4 sm:py-8">
        <DisclaimerBanner text={DISCLAIMER} subtle />
      </div>
    </AppShell>
  );
}
