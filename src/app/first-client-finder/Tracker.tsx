"use client";

export default function Tracker({
  count,
  total,
  allSent,
}: {
  count: number;
  total: number;
  allSent: boolean;
}) {
  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">Progress</p>
        <p className="font-display text-2xl tracking-tightish text-ink">
          <span className="text-ink">{count}</span>
          <span className="mx-1 text-ink/30">/</span>
          <span className="text-ink/50">{total}</span>
        </p>
      </div>
      <p className="mt-2 font-display text-xl leading-snug tracking-tightish text-ink/80 sm:text-2xl">
        {count === 0
          ? "Three conversations away from your first booking."
          : count < total
          ? `${total - count} ${total - count === 1 ? "message" : "messages"} to go.`
          : "You've started three conversations."}
      </p>
      <div className="mt-5 h-px w-full bg-ink/15">
        <div
          className="h-full bg-ink transition-[width] duration-500"
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
      {allSent && (
        <p className="mt-6 animate-fadeUp font-display text-lg italic leading-relaxed text-ink">
          Every Fora advisor began exactly here.
        </p>
      )}
    </div>
  );
}
