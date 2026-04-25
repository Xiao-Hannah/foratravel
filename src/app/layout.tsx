import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader } from "next/font/google";
import "./globals.css";

// Newsreader is a clean editorial serif — closer to Fora's Chiswick display
// face than Fraunces, and without the funky stylistic alternates.
const display = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fora Tools",
  description: "Lightweight tools for Fora travel advisors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable}>
      <body className="flex min-h-screen flex-col bg-cream font-sans text-ink">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-3 z-30 mx-3 mt-3 rounded-2xl border border-ink/10 bg-cream/90 px-5 py-3 backdrop-blur sm:mx-6 sm:px-7">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="flex flex-col leading-none"
          aria-label="Fora Tools, home"
        >
          <span className="font-display text-2xl font-normal tracking-tighter2 text-ink">
            FORA
          </span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink/70">
            Tools for Advisors
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.16em] text-ink/80 sm:flex">
          <Link href="/" className="transition hover:text-ink">
            All tools
          </Link>
          <a
            href="https://www.foratravel.com/join/advisor-onboarding"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink"
          >
            About Fora
          </a>
        </nav>
        <a
          href="https://www.foratravel.com/join"
          target="_blank"
          rel="noreferrer"
          className="rounded-cta bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cream transition hover:bg-black"
        >
          Apply
        </a>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-xs uppercase tracking-[0.16em] text-ink/55 sm:flex-row sm:items-center">
        <span className="font-display text-base normal-case tracking-tightish text-ink/80">
          Fora Tools
        </span>
        <span>Demo project for Fora Travel · 2026</span>
      </div>
    </footer>
  );
}
