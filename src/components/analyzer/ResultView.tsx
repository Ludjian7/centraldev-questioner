import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Download,
  MessageCircle,
  RefreshCcw,
  Route as RouteIcon,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { AnalysisResult, Insight, Tier } from "@/lib/analyzer/scoring";
import { exportResultPdf } from "@/lib/analyzer/pdf";
import { InvestmentComparison } from "./InvestmentComparison";
import { PriceJustification } from "./PriceJustification";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const tierBadge: Record<Tier, string> = {
  STARTER: "bg-secondary text-secondary-foreground",
  PROFESSIONAL: "bg-accent/20 text-primary",
  BUSINESS: "bg-accent text-accent-foreground",
  ENTERPRISE: "bg-primary text-primary-foreground",
};

export function ResultView({ result, onReset }: Props) {
  const {
    tierInfo,
    summary,
    insights,
    riskAreas,
    score,
    maxScore,
    affordability,
    growthPath,
    rationale,
  } = result;
  const pct = Math.round((score / Math.max(1, maxScore)) * 100);

  const waMessage = encodeURIComponent(
    `Halo, saya ${summary.businessName}. Berdasarkan asesmen, sistem yang direkomendasikan adalah ${tierInfo.name} (${result.tier}). Saya ingin diskusi lebih lanjut.`,
  );

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Hasil analisa untuk {summary.businessName}
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-display font-semibold tracking-tight leading-tight">
          Sistem yang tepat untuk Anda adalah{" "}
          <span className="text-gradient">{tierInfo.name}</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
          {tierInfo.tagline}
        </p>
      </div>

      {/* Affordability banner — wajib tampil sebelum hasil utama bila stretch/forced */}
      {affordability.status !== "healthy" && (
        <div
          className={`mt-8 rounded-2xl border p-5 ${
            affordability.status === "forced-down"
              ? "border-warning/40 bg-warning/[0.08]"
              : affordability.status === "stretch"
                ? "border-warning/30 bg-warning/[0.05]"
                : "border-border bg-surface"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold">
                {affordability.status === "forced-down"
                  ? `Rekomendasi diturunkan ke ${tierInfo.name}`
                  : affordability.status === "stretch"
                    ? `Catatan kelayakan investasi`
                    : `Rasio investasi perlu diperhatikan`}
              </div>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                {affordability.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Score meter */}
      <div className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Level Kebutuhan Sistem</span>
          <span className="tabular-nums text-muted-foreground">
            {score} / {maxScore} poin
          </span>
        </div>
        <div className="mt-3 relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full gradient-primary"
          />
        </div>
        <div className="mt-3 flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Starter</span>
          <span>Professional</span>
          <span>Business</span>
          <span>Enterprise</span>
        </div>
      </div>

      {/* Summary grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat label="Cabang" value={summary.branches} />
        <SummaryStat label="Volume Transaksi" value={summary.transactions} />
        <SummaryStat label="Omzet Bulanan" value={summary.revenue} />
        <SummaryStat
          label="Kanal Penjualan"
          value={`${summary.channels.length} kanal`}
        />
      </div>

      {/* Rationale — narasi spesifik berbasis data */}
      <section className="mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <TrendingUp className="h-3.5 w-3.5" />
          Analisa Kebutuhan Strategis
        </div>
        <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight">
          Disesuaikan dengan profil {summary.businessName}
        </h2>
        <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <p className="text-[15px] leading-relaxed">{rationale}</p>
        </div>

        <div className="mt-5 space-y-3">
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins} />
          ))}
        </div>
      </section>

      {/* Risk areas — kondisional, hanya muncul jika ada */}
      {riskAreas.length > 0 && (
        <section className="mt-8 rounded-3xl border border-warning/30 bg-warning/[0.06] p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" />
            Area Risiko & Celah Efisiensi
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {riskAreas.map((r) => (
              <span
                key={r}
                className="rounded-full border border-warning/40 bg-surface px-3 py-1 text-xs font-medium"
              >
                {r}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Recommendation Card */}
      <section className="mt-10 overflow-hidden rounded-3xl border border-border bg-primary text-primary-foreground shadow-elevated">
        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${tierBadge[result.tier]}`}
              >
                Tingkat {result.tier}
              </span>
              <h3 className="mt-3 text-3xl font-display font-semibold tracking-tight">
                {tierInfo.name}
              </h3>
              <p className="mt-1 text-xs opacity-70">{tierInfo.scopeNote}</p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider opacity-70">
                Estimasi Investasi
              </div>
              <div className="mt-1 text-2xl font-display font-semibold">
                {tierInfo.priceRange}
              </div>
              <div className="mt-1 text-xs opacity-70">
                Implementasi {tierInfo.implementation}
              </div>
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed opacity-90">
            {tierInfo.description}
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {tierInfo.features.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/30">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
                <span className="text-sm leading-snug opacity-95">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/10 p-5 sm:p-6 flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:halo@example.com?subject=Permintaan%20Proposal%20Detail"
            className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-accent-foreground transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            Dapatkan Proposal & ROI
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={`https://wa.me/6281234567890?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
            Konsultasi Strategis
          </a>
        </div>
      </section>

      {/* Transparansi harga: proaktif menjawab 'kenapa semahal itu?' */}
      <PriceJustification
        tierInfo={tierInfo}
        affordability={affordability}
        tier={result.tier}
      />

      {/* Perbandingan investasi jangka panjang */}
      <InvestmentComparison
        tier={result.tier}
        branchCount={summary.branchCount}
        midInvestment={affordability.midInvestment}
      />

      {/* Growth path */}
      <section className="mt-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <RouteIcon className="h-3.5 w-3.5" />
          Roadmap Pengembangan Sistem
        </div>
        <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight">
          Investasi tidak harus sekaligus
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Roadmap upgrade bertahap — mulai dari yang esensial, tambah modul saat bisnis tumbuh.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {growthPath.map((step, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-5 ${
                i === 0
                  ? "border-accent/50 bg-accent/[0.06] shadow-soft"
                  : "border-border bg-surface"
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-accent">
                {step.horizon}
              </div>
              <div className="mt-2 font-display text-lg font-semibold leading-tight">
                {step.label}
              </div>
              <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                {step.invest}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {step.detail}
              </p>
              {i < growthPath.length - 1 && (
                <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Secondary actions */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => exportResultPdf(result)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-soft"
        >
          <Download className="h-4 w-4" />
          Unduh ringkasan (PDF)
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Ulangi asesmen
        </button>
      </div>
    </motion.div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-tight">{value}</div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const tone =
    insight.level === "critical"
      ? "border-destructive/30 bg-destructive/[0.04]"
      : insight.level === "warning"
        ? "border-warning/30 bg-warning/[0.05]"
        : "border-border bg-surface";

  const dot =
    insight.level === "critical"
      ? "bg-destructive"
      : insight.level === "warning"
        ? "bg-warning"
        : "bg-accent";

  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="flex-1">
          <div className="text-[15px] font-semibold leading-snug">
            {insight.title}
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {insight.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
