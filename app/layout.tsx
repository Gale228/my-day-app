import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: {
    default: "Мой день",
    template: "%s · Мой день",
  },
  description: "Личный планировщик дел и расходов",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f4f8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={manrope.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
