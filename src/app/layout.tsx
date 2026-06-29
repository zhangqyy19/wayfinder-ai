import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wayfinder AI — Smart Multi-Stop Navigation",
  description:
    "Intelligent route planner with multi-stop optimization, restroom finder, and free WiFi locator.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-surface text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}