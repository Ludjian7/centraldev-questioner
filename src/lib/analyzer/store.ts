import { useCallback, useState } from "react";
import { visibleQuestions } from "./questions";

export interface AnalyzerState {
  answers: Record<string, unknown>;
  step: number; // 0 = intro, 1..N = questions, N+1 = result
}

export function useAnalyzer() {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState(0);

  const questions = visibleQuestions(answers);
  const total = questions.length;

  const setAnswer = useCallback((id: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const next = useCallback(() => setStep((s) => s + 1), []);
  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const goTo = useCallback((s: number) => setStep(s), []);
  const reset = useCallback(() => {
    setAnswers({});
    setStep(0);
  }, []);

  return {
    answers,
    step,
    questions,
    total,
    setAnswer,
    next,
    prev,
    goTo,
    reset,
  };
}
