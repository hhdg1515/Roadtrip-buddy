import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "OpenSeason",
  description:
    "California road trip planning that ranks what is actually worth doing right now.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="page-shell min-h-screen">
          <SiteNav />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-16 sm:px-6 lg:px-10">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
