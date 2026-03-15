import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "旭衡电子 | AlwaysControl Technology",
    template: "%s | 旭衡电子",
  },
  description: "AlwaysControl Technology — 跨品牌能源管理解决方案，覆盖户用储能、工商储、充电站、VPP全场景",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn(geist.variable, inter.variable, plusJakartaSans.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
