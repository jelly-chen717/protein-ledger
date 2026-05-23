import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "增肌账本 / Protein Ledger",
  description: "蛋白质摄入记录和日常记账工具",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "增肌账本",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" }
    ],
    apple: [{ url: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#277a52"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <ServiceWorkerRegister />
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-28 pt-5 sm:px-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
