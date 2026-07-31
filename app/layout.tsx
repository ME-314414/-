import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "孟宪一 | AI Visual Designer",
  description: "孟宪一的个人作品集 - AI 视觉、品牌设计与内容创作。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
