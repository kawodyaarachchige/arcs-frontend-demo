import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import { DemoControlBar } from "@/components/demo/DemoControlBar";
import { SiteNav } from "@/components/layout/SiteNav";
import { StoreHydration } from "@/components/layout/StoreHydration";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARIS Demo",
  description:
    "How the same checkout behaves under STATIC fixed retries vs ARIS adaptive decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} ${geistMono.variable} h-full`}
    >
      <body className="app-shell antialiased">
        <StoreHydration />
        <SiteNav />
        <DemoControlBar />
        {children}
      </body>
    </html>
  );
}
