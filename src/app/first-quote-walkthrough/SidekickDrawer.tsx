"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  type ClientBrief,
  type Hotel,
  cardEarnings,
  fmtMoney,
} from "./data";

export type ChatMessage = {
  id: string;
  role: "user" | "sidekick";
  text: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  brief: ClientBrief;
  clientName?: string;
  /** Hotels currently visible/sorted in the parent — used to seed answers. */
  hotels: Hotel[];
  /** Optional initial user query (e.g. typed into the inline input). */
  seedQuery?: string;
};

/**
 * Right-side chat drawer. Stateful chat history lives here so it persists
 * across open/close cycles within the same step. The first time the drawer
 * opens with no history, it seeds a canned user question + Sidekick reply
 * grounded in the current brief.
 */
export function SidekickDrawer({
  open,
  onClose,
  brief,
  clientName,
  hotels,
  seedQuery,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const seededRef = useRef(false);
  const seedQueryConsumedRef = useRef<string | null>(null);

  const who = clientName?.trim() || "your client";
  const where = brief.destination?.trim() || "their trip";

  // Seed the conversation the first time the drawer is opened. Subsequent
  // opens reuse the prior history.
  useEffect(() => {
    if (!open || seededRef.current) return;
    seededRef.current = true;
    const firstUser: ChatMessage = {
      id: "seed-u",
      role: "user",
      text: `I'm looking at suppliers for ${who}'s ${where} trip. Which property gives the best value?`,
    };
    setMessages([firstUser, buildReply("seed-r", firstUser.text, hotels, brief)]);
  }, [open, who, where, hotels, brief]);

  // If a query was typed into the inline bar, treat it as the user's next
  // message when the drawer opens.
  useEffect(() => {
    if (!open) return;
    if (!seedQuery) return;
    if (seedQueryConsumedRef.current === seedQuery) return;
    seedQueryConsumedRef.current = seedQuery;
    const userMsg: ChatMessage = {
      id: `q-${Date.now()}`,
      role: "user",
      text: seedQuery,
    };
    setMessages((prev) => [
      ...prev,
      userMsg,
      buildReply(`a-${Date.now()}`, seedQuery, hotels, brief),
    ]);
  }, [open, seedQuery, hotels, brief]);

  // Auto-scroll to newest message.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Focus input when drawer opens.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((prev) => [
      ...prev,
      userMsg,
      buildReply(`s-${Date.now()}`, text, hotels, brief),
    ]);
    setInput("");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-ink/30 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ask Sidekick"
        aria-hidden={!open}
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md bg-wtCard shadow-xl border-l border-wtBorder",
          "flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-wtBorder">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink leading-tight">
              ✨ Ask Sidekick
            </h2>
            <p className="text-xs text-wtMuted">
              Your AI co-pilot for this booking
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="text-wtMuted hover:text-ink p-1 rounded-md hover:bg-wtMutedBg transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-wtBg"
        >
          {messages.length === 0 && (
            <p className="text-xs text-wtMuted text-center mt-8">
              Ask anything about your client&rsquo;s trip.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                m.role === "user"
                  ? "ml-auto bg-brown text-white rounded-br-sm"
                  : "mr-auto bg-wtCard border border-wtBorder text-ink rounded-bl-sm",
              )}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-wtBorder px-4 py-3 flex gap-2 bg-wtCard"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sidekick anything…"
            className="flex-1 min-w-0 px-3 py-2 rounded-md border border-wtBorder bg-wtCard text-sm focus:outline-none focus:ring-2 focus:ring-brown/40"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              "shrink-0 text-sm font-semibold px-4 py-2 rounded-md transition-colors",
              input.trim()
                ? "bg-brown hover:bg-brownHover text-white"
                : "bg-wtMutedBg text-wtMuted cursor-not-allowed",
            )}
          >
            Send
          </button>
        </form>
      </aside>
    </>
  );
}

/**
 * Deterministic mock reply. Picks the strongest Reserve match in the
 * current visible list, or the highest-rated hotel overall, and tailors the
 * sentence to the question (value / perks / commission).
 */
function buildReply(
  id: string,
  question: string,
  hotels: Hotel[],
  brief: ClientBrief,
): ChatMessage {
  const list = hotels.length > 0 ? hotels : [];
  const reserve = list.filter((h) => h.isReserve);
  const pick =
    reserve.sort((a, b) => cardEarnings(b) - cardEarnings(a))[0] ??
    [...list].sort((a, b) => b.rating - a.rating)[0];

  if (!pick) {
    return {
      id,
      role: "sidekick",
      text: "I couldn't find any matching properties yet — try adjusting the filters and ask me again.",
    };
  }

  const earn = fmtMoney(cardEarnings(pick));
  const perks = pick.perks?.slice(0, 2).join(" and ").toLowerCase();
  const q = question.toLowerCase();

  if (/perk|amenit|extra|upgrade/.test(q) && perks) {
    return {
      id,
      role: "sidekick",
      text: `${pick.name} stands out on perks — ${perks}. You'd also earn an estimated ${earn} on this booking.`,
    };
  }
  if (/commission|earn|pay|money/.test(q)) {
    return {
      id,
      role: "sidekick",
      text: `${pick.name} is your highest-commission match at an estimated ${earn} for this booking${
        pick.isReserve ? " (Fora Reserve rate)" : ""
      }.`,
    };
  }
  if (/value|best|recommend|which/.test(q)) {
    return {
      id,
      role: "sidekick",
      text: pick.isReserve
        ? `For ${brief.destination || "this destination"}, I'd start with ${pick.name} — Fora Reserve perks${
            perks ? ` like ${perks}` : ""
          }, plus an estimated ${earn} in commission for you.`
        : `${pick.name} is your top-rated option at ${pick.rating.toFixed(
            1,
          )} stars, with an estimated ${earn} in commission.`,
    };
  }
  return {
    id,
    role: "sidekick",
    text: `Based on what your client wants, ${pick.name} is a strong fit. Estimated earnings on this booking: ${earn}.`,
  };
}

