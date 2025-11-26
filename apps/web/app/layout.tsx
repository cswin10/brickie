import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans bg-warm-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
