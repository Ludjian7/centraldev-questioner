import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Question } from "@/lib/analyzer/questions";
import { SECTIONS } from "@/lib/analyzer/questions";
import { isAnswered } from "@/lib/analyzer/scoring";
import { ProgressBar } from "./ProgressBar";
import { QuestionInput } from "./QuestionInput";

interface Props {
  question: Question;
  index: number; // 0-based
  total: number;
  value: unknown;
  onChange: (v: unknown) => void;
  onNext: () => void;
  onPrev: () => void;
  canPrev: boolean;
}

export function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
  onNext,
  onPrev,
  canPrev,
}: Props) {
  const ready = isAnswered(question, value);
  const section = SECTIONS.find((s) => s.id === question.section)?.label;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !e.shiftKey) {
        // text & number inputs handle their own Enter; for choice questions Enter advances
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "TEXTAREA" && tag !== "INPUT" && ready) {
          e.preventDefault();
          onNext();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onNext]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <ProgressBar current={index + 1} total={total} sectionLabel={section} />

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8"
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-accent">
          Pertanyaan {index + 1}
        </div>
        <h2 className="mt-2 text-2xl sm:text-[28px] font-display font-semibold leading-tight tracking-tight">
          {question.title}
        </h2>
        {question.subtitle && (
          <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
            {question.subtitle}
          </p>
        )}

        <div className="mt-7">
          <QuestionInput
            question={question}
            value={value}
            onChange={onChange}
            onSubmit={() => ready && onNext()}
          />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:shadow-elevated hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
          >
            {index + 1 === total ? "Lihat Hasil" : "Lanjut"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {!question.required && (
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Pertanyaan opsional · boleh dilewati
          </div>
        )}
      </motion.div>
    </div>
  );
}
