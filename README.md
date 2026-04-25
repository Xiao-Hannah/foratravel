# Fora Tools

A small collection of self-serve, no-login web tools for new Fora travel advisors.

## Tool 1: First Client Finder

Helps a new advisor identify their first 3 potential clients from their existing network and send a personalized outreach message in minutes.

- 3-question quiz (background, network, specialty)
- Returns 3 distinct archetypes — one **close tie**, one **weak tie**, one **broadcast** — so the advisor sees the breadth of their network, not 3 variants of the same person
- Live recipient-name fill on each card (typing the name is itself a commitment device)
- "Why this person?" rationale for each card
- "What to say if they reply" follow-up template (removes the bigger blocker)
- Copy / Mark-as-sent actions with progress tracker
- All state persisted to `localStorage` — refresh-safe, no backend, no PII

Open at `/tools/first-client-finder`.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS 3

## Run

```powershell
npm install
npm run dev
```

Then open http://localhost:3000.

## Architecture

```
src/
  app/
    page.tsx                          # Multi-tool hub
    layout.tsx
    globals.css
    tools/
      first-client-finder/
        page.tsx                      # Server component shell
        FirstClientFinder.tsx         # Client component — quiz + results
        data.ts                       # Types, options, rule-based recommend()
  lib/
    usePersistentState.ts             # SSR-safe localStorage hook
```

The recommendation engine is pure, deterministic, and lives entirely in `data.ts`. To add a new archetype, edit `buildClose` / `buildWeak` / `buildBroadcast`.

## Adding more tools

Each tool lives at `src/app/tools/<slug>/` and is registered in the `tools` array in `src/app/page.tsx`.
