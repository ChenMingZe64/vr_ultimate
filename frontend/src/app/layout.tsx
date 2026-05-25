import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "东莞理工学院 · 数字校园VR全景",
  description:
    "东莞理工学院数字校园沉浸式VR全景门户 — 360°校园漫游、AI智能导览、智慧校园服务。",
  keywords: [
    "东莞理工学院",
    "VR全景",
    "数字校园",
    "360全景",
    "智慧校园",
    "校园漫游",
  ],
  openGraph: {
    title: "东莞理工学院 · 数字校园VR全景",
    description: "360°沉浸式漫游东莞理工学院校园，体验未来智慧校园。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0A0E27" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="h-full overflow-hidden bg-[#0A0E27] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
