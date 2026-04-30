import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { useAnalyzer } from "@/lib/analyzer/store";
import { analyze } from "@/lib/analyzer/scoring";
import { Intro } from "./Intro";
import { QuestionCard } from "./QuestionCard";
import { ResultView } from "./ResultView";
import { saveSubmission } from "@/server/submissions.functions";
import { Logo } from "@/components/Logo";

export function Analyzer() {
  const { answers, step, questions, total, setAnswer, next, prev, goTo, reset } =
    useAnalyzer();

  const isIntro = step === 0;
  const qIndex = step - 1;
  const isResult = step > total;

  const result = useMemo(() => (isResult ? analyze(answers) : null), [isResult, answers]);
  const savedRef = useRef(false);

  useEffect(() => {
    if (!isResult || !result || savedRef.current) return;
    savedRef.current = true;
    saveSubmission({
      data: {
        business_name: result.summary.businessName,
        answers: answers as Record<string, unknown>,
        score: result.score,
        max_score: result.maxScore,
        tier: result.tier,
        risk_areas: result.riskAreas,
      },
    }).catch((e) => {
      console.error("Failed to save submission:", e);
      savedRef.current = false;
    });
  }, [isResult, result, answers]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.55]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      {/* top brand bar */}
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <button
          onClick={() => goTo(0)}
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Centraldev Studio — kembali ke awal"
        >
          <Logo />
        </button>
        {!isIntro && !isResult && (
          <button
            onClick={() => goTo(0)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Mulai ulang
          </button>
        )}
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-5xl items-center justify-center px-6 pb-16">
        <AnimatePresence mode="wait">
          {isIntro && <Intro key="intro" onStart={next} />}

          {!isIntro && !isResult && questions[qIndex] && (
            <QuestionCard
              key={questions[qIndex].id}
              question={questions[qIndex]}
              index={qIndex}
              total={total}
              value={answers[questions[qIndex].id]}
              onChange={(v) => setAnswer(questions[qIndex].id, v)}
              onNext={next}
              onPrev={prev}
              canPrev={qIndex > 0}
            />
          )}

          {isResult && result && (
            <ResultView key="result" result={result} onReset={() => { savedRef.current = false; reset(); }} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
