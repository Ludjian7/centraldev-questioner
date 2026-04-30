import { motion } from "framer-motion";
import { DollarSign, CheckCircle2, Clock, Wrench, GraduationCap, ShieldCheck } from "lucide-react";
import type { Tier, TierInfo, AffordabilityCheck } from "@/lib/analyzer/scoring";

interface Props {
  tierInfo: TierInfo;
  affordability: AffordabilityCheck;
  tier: Tier;
}

// Breakdown komponen investasi per tier (persen alokasi)
const COST_BREAKDOWN: Record<Tier, { label: string; icon: React.ReactNode; pct: number; desc: string }[]> = {
  STARTER: [
    { label: "Analisa & Desain Sistem", icon: <DollarSign className="h-3.5 w-3.5" />, pct: 15, desc: "Pemetaan alur kerja & desain database" },
    { label: "Development & Integrasi", icon: <Wrench className="h-3.5 w-3.5" />, pct: 55, desc: "Pembuatan modul & pengujian penuh" },
    { label: "Training & Onboarding", icon: <GraduationCap className="h-3.5 w-3.5" />, pct: 15, desc: "Pelatihan tim operasional & admin" },
    { label: "Garansi & Dukungan 3 Bulan", icon: <ShieldCheck className="h-3.5 w-3.5" />, pct: 15, desc: "Perbaikan bug & penyesuaian pasca-go-live" },
  ],
  PROFESSIONAL: [
    { label: "Analisa & Desain Sistem", icon: <DollarSign className="h-3.5 w-3.5" />, pct: 15, desc: "Workshop kebutuhan & arsitektur multi-cabang" },
    { label: "Development & Integrasi", icon: <Wrench className="h-3.5 w-3.5" />, pct: 50, desc: "Modul multi-lokasi, sinkronisasi stok & marketplace" },
    { label: "Manajemen Proyek", icon: <Clock className="h-3.5 w-3.5" />, pct: 10, desc: "Koordinasi, deployment bertahap & UAT" },
    { label: "Training & Onboarding", icon: <GraduationCap className="h-3.5 w-3.5" />, pct: 10, desc: "Pelatihan kepala cabang & staf operasional" },
    { label: "Garansi & Dukungan 6 Bulan", icon: <ShieldCheck className="h-3.5 w-3.5" />, pct: 15, desc: "SLA respon 1×24 jam & pembaruan sistem" },
  ],
  BUSINESS: [
    { label: "Analisa & Desain Sistem", icon: <DollarSign className="h-3.5 w-3.5" />, pct: 12, desc: "Business process mapping & audit alur kerja" },
    { label: "Development & Integrasi", icon: <Wrench className="h-3.5 w-3.5" />, pct: 48, desc: "ERP ringan, procurement, keuangan & logistik" },
    { label: "Manajemen Proyek Dedicated", icon: <Clock className="h-3.5 w-3.5" />, pct: 12, desc: "PM khusus, sprint review & change management" },
    { label: "Training & SOP", icon: <GraduationCap className="h-3.5 w-3.5" />, pct: 13, desc: "Pelatihan per-divisi & dokumentasi SOP digital" },
    { label: "Garansi & Dukungan 12 Bulan", icon: <ShieldCheck className="h-3.5 w-3.5" />, pct: 15, desc: "Dukungan prioritas & optimasi performa" },
  ],
  ENTERPRISE: [
    { label: "Konsultasi & Arsitektur Enterprise", icon: <DollarSign className="h-3.5 w-3.5" />, pct: 12, desc: "Enterprise architecture & integrasi holding" },
    { label: "Development & Custom Workflow", icon: <Wrench className="h-3.5 w-3.5" />, pct: 45, desc: "Full ERP, BI, API custom & multi-entitas" },
    { label: "Manajemen Proyek & Change", icon: <Clock className="h-3.5 w-3.5" />, pct: 13, desc: "Agile delivery, change management & rollout" },
    { label: "Training Komprehensif", icon: <GraduationCap className="h-3.5 w-3.5" />, pct: 12, desc: "Pelatihan seluruh divisi & eksekutif report" },
    { label: "Garansi & SLA 24/7 (12 Bulan)", icon: <ShieldCheck className="h-3.5 w-3.5" />, pct: 18, desc: "Dedicated support engineer & SLA enterprise" },
  ],
};

function formatRupiah(n: number): string {
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1)} M`;
  return `Rp ${n} jt`;
}

export function PriceJustification({ tierInfo, affordability, tier }: Props) {
  const breakdown = COST_BREAKDOWN[tier];
  const mid = affordability.midInvestment; // juta
  const annualRevenue = affordability.estimatedAnnualRevenue; // juta/tahun
  const monthlyRevenue = Math.round(annualRevenue / 12);

  // Break-even dalam bulan: berapa % revenue yang setara investasi
  const breakEvenMonths = monthlyRevenue > 0 ? Math.round(mid / monthlyRevenue) : null;
  // Estimasi efisiensi: 5% dari revenue tahunan (konservatif)
  const annualEfficiencyGain = Math.round(annualRevenue * 0.05);
  const roi12m = annualRevenue > 0
    ? Math.round(((annualEfficiencyGain - mid) / mid) * 100)
    : null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Transparansi Investasi
      </div>
      <h2 className="mt-2 text-2xl font-display font-semibold tracking-tight">
        Apa yang Anda dapatkan dengan {tierInfo.priceRange}?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Harga bukan angka tebak — ini adalah akumulasi jam kerja profesional, lisensi, infrastruktur, dan komitmen jangka panjang kami terhadap sistem Anda.
      </p>

      {/* Breakdown komponen biaya */}
      <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-4">
        <div className="text-sm font-semibold">Breakdown Komponen Investasi</div>
        {breakdown.map((item, i) => {
          const amountJuta = Math.round(mid * item.pct / 100);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-primary">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold leading-tight">{item.label}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    ~{formatRupiah(amountJuta)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ delay: i * 0.07 + 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full gradient-primary opacity-70"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-semibold text-muted-foreground">Total Estimasi</span>
          <span className="font-display text-lg font-bold text-foreground">{tierInfo.priceRange}</span>
        </div>
      </div>

      {/* ROI & break-even */}
      {breakEvenMonths !== null && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Setara berapa bulan revenue?
            </div>
            <div className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
              {breakEvenMonths} <span className="text-base font-medium text-muted-foreground">bulan</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Investasi ini setara {breakEvenMonths} bulan omzet Anda — setelah itu, sistem bekerja untuk Anda secara permanen tanpa biaya tambahan.
            </p>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-accent/[0.06] p-5">
            <div className="text-[11px] uppercase tracking-wider text-accent font-semibold">
              Estimasi efisiensi tahun pertama
            </div>
            <div className="mt-2 font-display text-3xl font-bold tabular-nums text-foreground">
              ~{formatRupiah(annualEfficiencyGain)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Rata-rata bisnis menghemat 5–8% revenue/tahun dari otomatisasi stok, laporan, dan pengurangan kebocoran operasional.
              {roi12m !== null && roi12m > 0 && (
                <> Potensi ROI tahun pertama: <strong className="text-foreground">~{roi12m}%</strong>.</>
              )}
            </p>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        * Breakdown adalah estimasi berdasarkan rata-rata proyek serupa. Komposisi aktual dapat berbeda sesuai scope akhir yang disepakati bersama. Angka efisiensi bersifat konservatif berdasarkan studi kasus implementasi di industri retail & distribusi Indonesia.
      </p>
    </section>
  );
}
