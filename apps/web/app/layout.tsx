import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brickie - Quick Estimates for Bricklayers",
  description:
    "AI-powered quick estimate tool for UK bricklayers. Snap a photo, get instant material and labour estimates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-warm-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
