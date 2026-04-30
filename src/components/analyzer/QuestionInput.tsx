import { Check } from "lucide-react";
import type { Option, Question } from "@/lib/analyzer/questions";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onSubmit: () => void;
}

export function QuestionInput({ question, value, onChange, onSubmit }: Props) {
  if (question.type === "single") {
    return (
      <div className="space-y-2.5">
        {question.options?.map((opt) => (
          <OptionRow
            key={opt.value}
            option={opt}
            selected={value === opt.value}
            onClick={() => {
              onChange(opt.value);
              // small delay so user sees selection
              setTimeout(onSubmit, 220);
            }}
          />
        ))}
      </div>
    );
  }

  if (question.type === "multiple") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (v: string) => {
      const next = selected.includes(v)
        ? selected.filter((x) => x !== v)
        : [...selected, v];
      onChange(next);
    };
    return (
      <div className="space-y-2.5">
        {question.options?.map((opt) => (
          <OptionRow
            key={opt.value}
            option={opt}
            selected={selected.includes(opt.value)}
            multi
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>
    );
  }

  if (question.type === "text") {
    return (
      <div>
        <textarea
          autoFocus
          rows={3}
          maxLength={500}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={question.placeholder}
          className="w-full resize-none rounded-2xl border border-border bg-surface px-5 py-4 text-base shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:shadow-glow"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          Tekan ⌘/Ctrl + Enter untuk lanjut
        </div>
      </div>
    );
  }

  if (question.type === "number") {
    return (
      <input
        autoFocus
        type="number"
        value={(value as number) ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={question.placeholder}
        className="w-full rounded-2xl border border-border bg-surface px-5 py-4 text-base shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:shadow-glow"
      />
    );
  }

  return null;
}

function OptionRow({
  option,
  selected,
  onClick,
  multi,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full text-left flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all",
        "hover:border-accent/60 hover:shadow-soft hover:-translate-y-0.5",
        selected
          ? "border-primary bg-primary/[0.03] shadow-soft"
          : "border-border bg-surface",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center transition-all",
          multi ? "rounded-md" : "rounded-full",
          selected
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface text-transparent group-hover:border-accent",
        ].join(" ")}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-medium leading-snug">{option.label}</div>
        {option.description && (
          <div className="mt-0.5 text-sm text-muted-foreground">
            {option.description}
          </div>
        )}
      </div>
    </button>
  );
}
