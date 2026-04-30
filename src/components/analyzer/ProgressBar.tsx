import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number; // 1-indexed
  total: number;
  sectionLabel?: string;
}

export function ProgressBar({ current, total, sectionLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
        <span className="uppercase tracking-wider">
          {sectionLabel ?? "Asesmen"}
        </span>
        <span className="tabular-nums">
          {current} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full gradient-primary"
        />
      </div>
    </div>
  );
}
