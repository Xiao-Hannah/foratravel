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
      <nav className="mb-10 flex items-center justify-end text-xs uppercase tracking-[0.16em] text-ink/55">
        <Link
          href="/first-client-finder/log"
          className="transition hover:text-ink"
        >
          Outreach log
        </Link>
      </nav>
      <FirstClientFinder />
    </main>
  );
}
