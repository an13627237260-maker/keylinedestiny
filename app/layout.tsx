import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keyline Destiny · 命理星盘",
  description:
    "传统命理规则与本地算法生成报告。仅供娱乐与传统文化参考，不构成现实决策依据。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg-deep)] text-[var(--text-main)]">
        {children}
      </body>
    </html>
  );
}
