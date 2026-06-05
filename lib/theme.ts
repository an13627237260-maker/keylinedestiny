export const ELEMENT_COLORS: Record<string, string> = {
  木: "var(--element-wood)",
  火: "var(--element-fire)",
  土: "var(--element-earth)",
  金: "var(--element-metal)",
  水: "var(--element-water)",
};

export const NAV_ITEMS = [
  { href: "/", label: "首页", mobileLabel: "首页" },
  { href: "/bazi", label: "八字", mobileLabel: "八字" },
  { href: "/tarot", label: "塔罗", mobileLabel: "塔罗" },
  { href: "/zodiac", label: "星座", mobileLabel: "星座" },
  { href: "/name", label: "姓名", mobileLabel: "姓名" },
  { href: "/love", label: "合盘", mobileLabel: "合盘" },
  { href: "/reports", label: "历史", mobileLabel: "历史" },
] as const;
