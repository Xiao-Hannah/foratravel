"use client";

import { Check } from "lucide-react";
import { fmtMoney } from "./data";

type Props = {
  earnings: number;
  onRestart: () => void;
};

export function Step5Complete({ earnings, onRestart }: Props) {
  return (
    <div className="pt-[60px] pb-16 text-center">
      {/* Animated check */}
      <div className="check-pop mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-success">
        <Check size={44} strokeWidth={3} className="text-white" />
      </div>

      <h1 className="text-[28px] font-bold leading-tight">
        Your quote is on its way.
      </h1>
      <p className="text-wtMuted text-sm mt-3 mb-8 max-w-md mx-auto">
        You just did what most new advisors take weeks to do.
      </p>

      <div className="bg-wtCard rounded-xl p-6 shadow-sm border border-wtBorder/70 max-w-[400px] mx-auto">
        <p className="text-xs text-wtMuted">
          Estimated earnings from this booking
        </p>
        <p className="text-[48px] font-bold text-earn leading-none my-2">
          {fmtMoney(earnings)}
        </p>
        <p className="text-xs text-wtMuted">Paid after trip completion</p>
      </div>

      <div className="max-w-[400px] mx-auto mt-8 space-y-3">
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 rounded-md font-semibold text-white text-sm bg-brown hover:bg-brownHover transition-colors"
        >
          Send another quote →
        </button>
      </div>

      <p className="text-xs text-wtMuted mt-8">
        Questions? Sidekick is always available in your Portal.
      </p>
    </div>
  );
}
