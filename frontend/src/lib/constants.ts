export const SITE = {
  name: "东莞理工学院",
  nameEn: "DGUT",
  tagline: "数字校园沉浸式门户平台",
  description:
    "东莞理工学院数字校园沉浸式门户平台 — 探索未来智慧校园，体验3D校园漫游、AI智能导览、校园文化展示。",
  url: "https://campus.dgut.edu.cn",
  ogImage: "/images/og-image.png",
} as const;

export const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "数字校园地图", href: "/campus-map" },
  { label: "校园文化馆", href: "/culture-hall" },
  { label: "智慧校园", href: "/smart-campus" },
  { label: "AI 助手", href: "/ai-assistant" },
  { label: "数据大屏", href: "/dashboard" },
] as const;

export const STATS = [
  { label: "建校历史", value: "30+", suffix: "年" },
  { label: "在校学生", value: "20000+", suffix: "人" },
  { label: "学科专业", value: "58", suffix: "个" },
  { label: "实验室", value: "120+", suffix: "间" },
  { label: "校园面积", value: "1500+", suffix: "亩" },
] as const;
