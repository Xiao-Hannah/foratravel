import Link from "next/link";
import OutreachLog from "../OutreachLog";

export const metadata = {
  title: "Outreach Log · First Client Finder · Fora Tools",
  description:
    "Track the contacts you've reached out to from First Client Finder — replies, bookings, and follow-ups, all on this device.",
};

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:pt-14">
      <nav className="mb-10 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-ink/55">
        <Link
          href="/first-client-finder"
          className="inline-flex items-center gap-2 transition hover:text-ink"
        >
          <span aria-hidden>←</span> Finder
        </Link>
        <span>Tool 01 · Log</span>
      </nav>
      <OutreachLog />
    </main>
  );
}
