"use client";

import { useState } from "react";
import { usePersistentState } from "@/lib/usePersistentState";
import { Answers } from "./data";
import {
  EMPTY_CARD,
  SavedSession,
  Stage,
  STORAGE_KEY,
  emptySession,
} from "./session";
import Intro from "./Intro";
import Quiz from "./Quiz";
import Results from "./Results";

export default function FirstClientFinder() {
  const [session, setSession, hydrated] = usePersistentState<SavedSession>(
    STORAGE_KEY,
    emptySession,
  );

  // Stage is derived but allowed to override (e.g. user clicks "Start over").
  const [stageOverride, setStageOverride] = useState<Stage | null>(null);
  const stage: Stage =
    stageOverride ??
    (session.answers ? "results" : hydrated ? "intro" : "intro");

  // Quiz local state (only relevant during quiz stage)
  const [quizStep, setQuizStep] = useState(0);
  const [draft, setDraft] = useState<Partial<Answers>>({});

  function startQuiz() {
    setDraft({});
    setQuizStep(0);
    setStageOverride("quiz");
  }

  function completeQuiz(final: Answers) {
    setSession({ answers: final, cards: {} });
    setStageOverride("results");
  }

  function reset() {
    setSession(emptySession);
    setDraft({});
    setQuizStep(0);
    setStageOverride("intro");
  }

  if (stage === "intro") {
    return <Intro onStart={startQuiz} hasSavedSession={!!session.answers} />;
  }

  if (stage === "quiz") {
    return (
      <Quiz
        step={quizStep}
        draft={draft}
        onAnswer={(patch, isFinal) => {
          const next = { ...draft, ...patch };
          setDraft(next);
          if (isFinal) {
            completeQuiz(next as Answers);
          } else {
            setQuizStep((s) => s + 1);
          }
        }}
        onBack={() => {
          if (quizStep === 0) {
            setStageOverride("intro");
          } else {
            setQuizStep((s) => s - 1);
          }
        }}
      />
    );
  }

  // results
  return (
    <Results
      answers={session.answers!}
      cards={session.cards}
      onCardChange={(id, updater) =>
        setSession((prev) => {
          const current = prev.cards[id] ?? EMPTY_CARD;
          return {
            ...prev,
            cards: { ...prev.cards, [id]: updater(current) },
          };
        })
      }
      onReset={reset}
    />
  );
}
