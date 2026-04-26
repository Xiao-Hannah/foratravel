import Link from "next/link";
import FirstClientFinder from "./FirstClientFinder";

export const metadata = {
  title: "First Client Finder · Fora Tools",
  description:
    "Identify your first 3 potential clients and send a personalized outreach message in minutes.",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-14">
      <nav className="mb-10 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink/55">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition hover:text-ink"
        >
          <span aria-hidden>←</span> All tools
        </Link>
        <span>Tool 01</span>
      </nav>
      <FirstClientFinder />
    </main>
  );
}
