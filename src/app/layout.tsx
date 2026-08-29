import type { Metadata } from "next";
import "./globals.css";
import { MainShell } from "@/components/layout/MainShell";

export const metadata: Metadata = {
  title: "LegalMetrix – AI-Powered Legal Metrology Packaged Commodity Compliance System",
  description:
    "Automated compliance audit and inspection system for Indian Legal Metrology (Packaged Commodities) Rules, 2011.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}
