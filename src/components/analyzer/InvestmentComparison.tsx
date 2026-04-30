import { motion } from "framer-motion";
import { Check, Minus, TrendingDown, X } from "lucide-react";
import type { Tier } from "@/lib/analyzer/scoring";

interface Props {
  tier: Tier;
  branchCount: number; 
  midInvestment: number; 
}

// Benchmark biaya sistem berlangganan pihak ketiga per outlet/bulan
const SUBSCRIPTION_BENCHMARK: Record<Tier, { name: string; monthly: number }> = {
  STARTER: { name: "Platform Kasir Basic", monthly: 299_000 },
  PROFESSIONAL: { name: "Sistem POS Multi-outlet", monthly: 499_000 },
  BUSINESS: { name: "Sistem Pro Multi-cabang", monthly: 699_000 },
  ENTERPRISE: { name: "Enterprise Subscription / Odoo", monthly: 999_000 },
};

const HORIZON_YEARS = 5;
const MAINTENANCE_PCT = 0.18; 
const GROWTH_MULTIPLIER = 2; 

function formatRupiah(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${Math.round(n / 1_000_000)} jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
  return `Rp ${n}`;
}

export function InvestmentComparison({ tier, branchCount, midInvestment }: Props) {
  const benchmark = SUBSCRIPTION_BENCHMARK[tier];
  const startOutlets = Math.max(1, branchCount);
  
  const phase1 = benchmark.monthly * 12 * 2 * startOutlets;
  const grownOutlets = Math.max(startOutlets + 1, Math.round(startOutlets * GROWTH_MULTIPLIER));
  const phase2 = benchmark.monthly * 12 * 3 * grownOutlets;
  const subTotal5y = phase1 + phase2;

  const investRupiah = midInvestment * 1_000_000;
  const ours5y = investRupiah + investRupiah * MAINTENANCE_PCT * (HORIZON_YEARS - 1);

  const savings = subTotal5y - ours5y;
  const isCheaper = savings > 0;
  const savingsPct = Math.round((Math.abs(savings) / subTotal5y) * 100);

  const maxVal = Math.max(subTotal5y, ours5y);
  const subW = Math.round((subTotal5y / maxVal) * 100);
  const oursW = Math.round((ours5y / maxVal) * 100);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
        <TrendingDown className="h-3.5 w-3.5" />
        Analisa Investasi Jangka Panjang
      </div>
      <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight">
        Efisiensi vs Sistem Berlangganan
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Proyeksi {HORIZON_YEARS} tahun berdasarkan {startOutlets} outlet saat ini, dengan asumsi pertumbuhan ke {grownOutlets} outlet di tahun ke-3.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <div className="space-y-5">
          <BarRow
            label={benchmark.name}
            sublabel={`${formatRupiah(benchmark.monthly)}/outlet/bln (Estimasi biaya pihak ketiga)`}
            tag="Biaya Berlangganan"
            tagTone="muted"
            value={formatRupiah(subTotal5y)}
            widthPct={subW}
            barClass="bg-muted-foreground/40"
            delay={0.05}
          />
          <BarRow
            label="Investasi Sistem Mandiri"
            sublabel={`Implementasi awal ${formatRupiah(investRupiah)} + pemeliharaan berkala`}
            tag="Rekomendasi"
            tagTone="accent"
            value={formatRupiah(ours5y)}
            widthPct={oursW}
            barClass="gradient-primary"
            delay={0.2}
          />
        </div>

        <div
          className={`mt-6 rounded-2xl border p-5 ${
            isCheaper
              ? "border-accent/40 bg-accent/[0.08]"
              : "border-border bg-background"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isCheaper
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {isCheaper
                  ? `Efisiensi biaya ${formatRupiah(savings)} dalam ${HORIZON_YEARS} tahun`
                  : `Selisih investasi ${formatRupiah(-savings)} dibanding sistem langganan`}
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {isCheaper
                  ? `Setara ${savingsPct}% lebih efisien dibanding total biaya berlangganan — plus Anda memiliki aset kode, data, dan kontrol penuh.`
                  : `Investasi ini terbayar dengan kepemilikan aset penuh, kustomisasi alur kerja, dan perlindungan dari kenaikan biaya vendor di masa depan.`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <CompareCell label="Kepemilikan Aset (Kode & Data)" competitor={false} ours={true} />
          <CompareCell label="Kustomisasi Alur Kerja" competitor="limited" ours={true} />
          <CompareCell label="Tanpa Biaya Per-Outlet" competitor={false} ours={true} />
          <CompareCell label="Integrasi Sistem Internal" competitor="limited" ours={true} />
          <CompareCell label="Kebebasan Dari Vendor Lock-in" competitor={false} ours={true} />
          <CompareCell label="Biaya Tetap (Fix Cost)" competitor={false} ours={true} />
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          * Komparasi berdasarkan rata-rata biaya platform retail pihak ketiga 2025–2026. 
          Estimasi pemeliharaan industri standar 15–20%/tahun. Asumsi pertumbuhan bersifat ilustratif untuk kebutuhan draf proposal.
        </p>
      </div>
    </section>
  );
}

function BarRow({
  label,
  sublabel,
  tag,
  tagTone,
  value,
  widthPct,
  barClass,
  delay,
}: {
  label: string;
  sublabel: string;
  tag: string;
  tagTone: "accent" | "muted";
  value: string;
  widthPct: number;
  barClass: string;
  delay: number;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                tagTone === "accent"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {tag}
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>
        </div>
        <div className="font-display text-xl font-semibold tabular-nums">
          {value}
        </div>
      </div>
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
          className={`h-full ${barClass}`}
        />
      </div>
    </div>
  );
}

function CompareCell({
  label,
  competitor,
  ours,
}: {
  label: string;
  competitor: boolean | "limited";
  ours: boolean | "limited";
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[11px] font-medium leading-tight">{label}</div>
      <div className="mt-2 flex items-center gap-3 text-[11px]">
        <Indicator state={competitor} label="Langganan" />
        <Indicator state={ours} label="Milik Anda" />
      </div>
    </div>
  );
}

function Indicator({
  state,
  label,
}: {
  state: boolean | "limited";
  label: string;
}) {
  const icon =
    state === true ? (
      <Check className="h-3 w-3" strokeWidth={3} />
    ) : state === "limited" ? (
      <Minus className="h-3 w-3" strokeWidth={3} />
    ) : (
      <X className="h-3 w-3" strokeWidth={3} />
    );
  const cls =
    state === true
      ? "bg-accent/20 text-primary"
      : state === "limited"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-destructive/15 text-destructive";
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${cls}`}
      >
        {icon}
      </div>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
