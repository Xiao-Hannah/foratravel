"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { STORAGE_KEY } from "./session";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Link to the walkthrough that clears any persisted session first, so
 * clicking it from the homepage always lands the user on Step 1
 * ("Choose a preferred partner") with a clean slate.
 */
export function StartWalkthroughLink({ children, className }: Props) {
  return (
    <Link
      href="/first-quote-walkthrough"
      className={className}
      onClick={() => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore (private mode, quota, etc.)
        }
      }}
    >
      {children}
    </Link>
  );
}
