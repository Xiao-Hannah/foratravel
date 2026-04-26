"use client";

import { useEffect, useState } from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import { Answers, buildStarterPost } from "./data";
import {
  EMPTY_CARD,
  SavedSession,
  Stage,
  STORAGE_KEY,
  emptySession,
} from "./session";
import Intro from "./Intro";
import Quiz from "./Quiz";
import ValueProp from "./ValueProp";
import Results from "./Results";
import Toast from "./Toast";

export default function FirstClientFinder() {
  const [session, setSession, hydrated] = usePersistentState<SavedSession>(
    STORAGE_KEY,
    emptySession,
  );

  // Stage is derived but allowed to override (e.g. user clicks "Start over",
  // or returns to value-prop screen from results).
  const [stageOverride, setStageOverride] = useState<Stage | null>(null);
  const stage: Stage =
    stageOverride ??
    (session.answers ? "results" : hydrated ? "intro" : "intro");

  // Lightweight global toast for cross-stage actions (copy confirmations).
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  function startQuiz() {
    setStageOverride("quiz");
  }

  function completeQuiz(answers: Answers) {
    // Seed the post draft from the freshly built post so the value-prop
    // screen always shows a personalized starting point. The advisor can
    // edit (or reset) from there.
    setSession((prev) => ({
      ...prev,
      answers,
      postDraft: prev.postDraft ?? buildStarterPost(answers),
    }));
    setStageOverride("valueProp");
  }

  function reset() {
    setSession(emptySession);
    setStageOverride("intro");
  }

  if (stage === "intro") {
    return (
      <>
        <Intro onStart={startQuiz} hasSavedSession={!!session.answers} />
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  if (stage === "quiz") {
    return (
      <>
        <Quiz
          initial={session.answers ?? undefined}
          onComplete={completeQuiz}
          onBack={() => setStageOverride("intro")}
        />
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  if (stage === "valueProp") {
    if (!session.answers) {
      // Defensive fallback — shouldn't happen because completeQuiz sets
      // answers before transitioning, but keeps types honest.
      setStageOverride("quiz");
      return null;
    }
    return (
      <>
        <ValueProp
          answers={session.answers}
          postDraft={session.postDraft}
          onPostChange={(next) =>
            setSession((prev) => ({ ...prev, postDraft: next }))
          }
          onContinue={() => setStageOverride("results")}
          onBack={() => setStageOverride("quiz")}
          onToast={setToast}
        />
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  // results
  return (
    <Results
      answers={session.answers!}
      cards={session.cards}
      postDraft={session.postDraft}
      onCardChange={(id, updater) =>
        setSession((prev) => {
          const current = prev.cards[id] ?? EMPTY_CARD;
          return {
            ...prev,
            cards: { ...prev.cards, [id]: updater(current) },
          };
        })
      }
      onBackToValueProp={() => setStageOverride("valueProp")}
      onReset={reset}
    />
  );
}
