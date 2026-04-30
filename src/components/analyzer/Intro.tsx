import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Clock } from "lucide-react";

interface IntroProps {
  onStart: () => void;
}

export function Intro({ onStart }: IntroProps) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-xl mx-auto text-center"
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        Asesmen gratis · ±5 menit · Tanpa registrasi
      </div>

      <h1 className="mt-8 text-4xl sm:text-5xl font-display font-semibold leading-[1.05] tracking-tight">
        Sistem yang tepat untuk{" "}
        <span className="text-gradient">skala bisnis Anda</span>
      </h1>

      <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
        Asesmen singkat untuk memetakan kompleksitas operasional Anda dan
        merekomendasikan tingkat sistem serta estimasi investasi yang paling
        relevan.
      </p>

      <button
        onClick={onStart}
        className="mt-10 group inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-base font-medium text-primary-foreground shadow-elevated transition-all hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0"
      >
        Mulai Asesmen
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <Feature
          icon={<Clock className="h-4 w-4" />}
          title="Singkat & fokus"
          desc="15 pertanyaan terstruktur"
        />
        <Feature
          icon={<Sparkles className="h-4 w-4" />}
          title="Insight nyata"
          desc="Identifikasi pain point operasional"
        />
        <Feature
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Rahasia"
          desc="Data Anda tidak dibagikan"
        />
      </div>
    </motion.div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-primary">
        {icon}
      </div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
