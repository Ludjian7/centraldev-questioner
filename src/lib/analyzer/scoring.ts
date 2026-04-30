import { QUESTIONS, visibleQuestions, type Question } from "./questions";

export type Tier = "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE";

export interface TierInfo {
  tier: Tier;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  priceMin: number; // juta rupiah
  priceMax: number; // juta rupiah
  priceRange: string;
  implementation: string;
  scopeNote: string; // gambaran skala bisnis ideal
}

export const TIERS: Record<Tier, TierInfo> = {
  STARTER: {
    tier: "STARTER",
    name: "Sistem Starter",
    tagline: "Standardisasi Operasional Bisnis",
    description:
      "Solusi tepat untuk merapikan administrasi dan stok pada bisnis satu lokasi. Menghilangkan ketergantungan pada pencatatan manual/Excel.",
    features: [
      "Pencatatan Penjualan & Stok Real-time",
      "Laporan Profit & Loss Otomatis",
      "Kontrol Kasir & Audit Trail",
      "Sistem Pembayaran Terintegrasi",
      "Implementasi Cepat & Pendampingan",
    ],
    priceMin: 15,
    priceMax: 40,
    priceRange: "Rp 15 – 40 juta",
    implementation: "2 – 3 minggu",
    scopeNote: "Optimasi 1 Lokasi",
  },
  PROFESSIONAL: {
    tier: "PROFESSIONAL",
    name: "Sistem Professional",
    tagline: "Skalabilitas & Kontrol Multi-Cabang",
    description:
      "Didesain untuk bisnis yang sedang ekspansi. Memastikan standar operasional yang sama di setiap cabang tanpa perlu pengawasan manual 24/7.",
    features: [
      "Konsolidasi Multi-Cabang Terpusat",
      "Manajemen Stok & Transfer Antar Lokasi",
      "Dashboard Analisa Performa Cabang",
      "Otomatisasi Pembelian & Supplier",
      "Integrasi Marketplace & Omnichannel",
      "Training & SOP Implementasi Terstruktur",
    ],
    priceMin: 45,
    priceMax: 90,
    priceRange: "Rp 45 – 90 juta",
    implementation: "4 – 8 minggu",
    scopeNote: "Ekspansi 2–5 Lokasi",
  },
  BUSINESS: {
    tier: "BUSINESS",
    name: "Sistem Business",
    tagline: "Otomatisasi & Efisiensi Skala Menengah",
    description:
      "Solusi untuk jaringan bisnis yang butuh kontrol ketat pada margin keuntungan dan otomatisasi alur kerja lintas departemen.",
    features: [
      "Manajemen Gudang & Logistik Terpadu",
      "Otomatisasi Procurement & PO",
      "Kontrol Margin & Budgeting Department",
      "Sistem Piutang & Aging Report B2B",
      "Laporan Keuangan Konsolidasi",
      "Dedicated Project Manager",
    ],
    priceMin: 95,
    priceMax: 200,
    priceRange: "Rp 95 – 200 juta",
    implementation: "8 – 12 minggu",
    scopeNote: "Konsolidasi 5–20 Lokasi",
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    name: "Sistem Enterprise",
    tagline: "Transformasi Digital & Multi-Entitas",
    description:
      "Sistem terpadu untuk ekosistem bisnis kompleks. Mengintegrasikan seluruh entitas bisnis dalam satu sumber data yang valid untuk pengambilan keputusan strategis.",
    features: [
      "Full ERP: Finance, HR, Supply Chain",
      "Konsolidasi Multi-Entitas & Holding",
      "Custom Workflow & API Integration",
      "Business Intelligence & Forecasting",
      "Audit & Security Compliance Tinggi",
      "Dedicated Support & SLA 24/7",
    ],
    priceMin: 250,
    priceMax: 500,
    priceRange: "Rp 250 – 500 juta+",
    implementation: "12 – 24 minggu",
    scopeNote: "Korporasi & Multi-Entitas",
  },
};

export interface Insight {
  level: "info" | "warning" | "critical";
  title: string;
  detail: string;
}

export interface AffordabilityCheck {
  ratio: number; // investasi / omzet tahunan
  ratioPct: number;
  status: "healthy" | "watch" | "stretch" | "forced-down";
  message: string;
  estimatedAnnualRevenue: number; // juta
  midInvestment: number; // juta
  forcedDown?: { from: Tier; to: Tier };
}

export interface GrowthStep {
  horizon: string;
  tier: Tier;
  label: string;
  invest: string;
  detail: string;
}

export interface AnalysisResult {
  score: number;
  maxScore: number;
  tier: Tier;
  tierInfo: TierInfo;
  rawTier: Tier; // sebelum affordability downgrade
  summary: {
    businessName: string;
    branches: string;
    branchCount: number; // estimasi numerik untuk perbandingan investasi
    transactions: string;
    channels: string[];
    revenue: string;
    revenueMid: number; // juta/bulan
  };
  insights: Insight[];
  riskAreas: string[];
  affordability: AffordabilityCheck;
  growthPath: GrowthStep[];
  rationale: string; // narasi spesifik berbasis input
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function labelFor(qid: string, value: unknown): string {
  const q = QUESTIONS.find((x) => x.id === qid);
  if (!q || !q.options) return String(value ?? "-");
  if (Array.isArray(value)) {
    return value
      .map((v) => q.options!.find((o) => o.value === v)?.label ?? String(v))
      .join(", ");
  }
  return q.options.find((o) => o.value === value)?.label ?? String(value ?? "-");
}

// Estimasi numerik dari pilihan
function branchCountFromAnswer(v: unknown): number {
  switch (v) {
    case "1":
      return 1;
    case "2-3":
      return 3;
    case "4-10":
      return 6;
    case "10+":
      return 15;
    default:
      return 1;
  }
}

function transactionsPerDay(v: unknown): number {
  switch (v) {
    case "lt50":
      return 30;
    case "50-200":
      return 120;
    case "200-1000":
      return 500;
    case "1000+":
      return 1500;
    default:
      return 0;
  }
}

// Estimasi midpoint omzet bulanan (juta)
function revenueMidFromAnswer(v: unknown): number {
  switch (v) {
    case "lt100":
      return 60;
    case "100-500":
      return 300;
    case "500-2m":
      return 1250;
    case "2m+":
      return 3500;
    default:
      return 100;
  }
}

// ─────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────

export function computeScore(answers: Record<string, unknown>): number {
  let total = 0;
  const visible = visibleQuestions(answers);
  for (const q of visible) {
    const v = answers[q.id];
    if (v == null) continue;
    if (q.type === "single") {
      const opt = q.options?.find((o) => o.value === v);
      if (opt?.score) total += opt.score;
    } else if (q.type === "multiple" && Array.isArray(v)) {
      for (const val of v) {
        const opt = q.options?.find((o) => o.value === val);
        if (opt?.score) total += opt.score;
      }
    } else if (q.type === "number" && typeof v === "number" && q.scoreFromNumber) {
      total += q.scoreFromNumber(v);
    }
  }
  return total;
}

export function maxPossibleScore(): number {
  let total = 0;
  for (const q of QUESTIONS) {
    if (q.type === "single") {
      total += Math.max(0, ...(q.options ?? []).map((o) => o.score ?? 0));
    } else if (q.type === "multiple") {
      total += (q.options ?? []).reduce((s, o) => s + Math.max(0, o.score ?? 0), 0);
    }
  }
  return total;
}

// Threshold disesuaikan dengan max score aktual (~50-an), dipetakan ke skala 0–86
// agar threshold yang user definisikan (0-25, 26-45, 46-65, 66-86) tetap berlaku
// pada distribusi skor sebenarnya. Kami pakai threshold proporsional terhadap max.
export function tierFromScore(score: number, max: number): Tier {
  const ref = 86; // skala referensi yang user definisikan
  const norm = (score / Math.max(1, max)) * ref;
  if (norm <= 25) return "STARTER";
  if (norm <= 45) return "PROFESSIONAL";
  if (norm <= 65) return "BUSINESS";
  return "ENTERPRISE";
}

const TIER_ORDER: Tier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"];

function downgrade(t: Tier): Tier {
  const i = TIER_ORDER.indexOf(t);
  return i > 0 ? TIER_ORDER[i - 1] : t;
}

// ─────────────────────────────────────────────────────────────
// Affordability check
// ─────────────────────────────────────────────────────────────

function buildAffordability(tier: Tier, revenueMid: number): AffordabilityCheck {
  const tierInfo = TIERS[tier];
  const midInvest = (tierInfo.priceMin + tierInfo.priceMax) / 2;
  const annualRev = revenueMid * 12;
  const ratio = annualRev > 0 ? midInvest / annualRev : 1;
  const ratioPct = Math.round(ratio * 1000) / 10; // 1 desimal

  if (ratio > 0.25) {
    const lower = downgrade(tier);
    return {
      ratio,
      ratioPct,
      status: "forced-down",
      message: `Investasi tier ${tierInfo.name} setara ${ratioPct}% dari omzet tahunan Anda — di atas batas sehat 15%. Kami menurunkan rekomendasi ke ${TIERS[lower].name} agar tetap proporsional dengan skala bisnis saat ini.`,
      estimatedAnnualRevenue: annualRev,
      midInvestment: midInvest,
      forcedDown: { from: tier, to: lower },
    };
  }

  if (ratio > 0.15) {
    return {
      ratio,
      ratioPct,
      status: "stretch",
      message: `Investasi setara ${ratioPct}% dari omzet tahunan — di atas range sehat 3–8% untuk UMKM. Pertimbangkan mulai dari paket lebih kecil atau cicilan modul bertahap.`,
      estimatedAnnualRevenue: annualRev,
      midInvestment: midInvest,
    };
  }

  if (ratio > 0.08) {
    return {
      ratio,
      ratioPct,
      status: "watch",
      message: `Rasio investasi vs omzet ${ratioPct}% — masih wajar, namun di atas median 3–8%. Pertimbangkan implementasi bertahap.`,
      estimatedAnnualRevenue: annualRev,
      midInvestment: midInvest,
    };
  }

  return {
    ratio,
    ratioPct,
    status: "healthy",
    message: `Rasio investasi vs omzet ${ratioPct}% — sehat, dalam range standar industri 3–8% untuk UMKM Indonesia.`,
    estimatedAnnualRevenue: annualRev,
    midInvestment: midInvest,
  };
}

// ─────────────────────────────────────────────────────────────
// Conditional insights & risks
// ─────────────────────────────────────────────────────────────

function buildInsights(answers: Record<string, unknown>): {
  insights: Insight[];
  risks: string[];
} {
  const insights: Insight[] = [];
  const risks: string[] = [];
  const pains = (answers.painPoints as string[]) ?? [];
  const channels = (answers.channels as string[]) ?? [];
  const payments = (answers.paymentMethods as string[]) ?? [];
  const branchCount = branchCountFromAnswer(answers.branches);
  const txPerDay = transactionsPerDay(answers.transactions);
  const revenueMid = revenueMidFromAnswer(answers.revenue);

  // === RISKS — kondisional ketat berbasis data ===

  // Inkonsistensi stok antar cabang: hanya jika cabang > 1
  if (branchCount > 1) {
    risks.push("Inkonsistensi stok antar cabang");
    insights.push({
      level: "warning",
      title: `Operasional ${branchCount}+ cabang menambah lapisan kompleksitas`,
      detail:
        "Mengelola lebih dari satu lokasi membuat sinkronisasi stok, kas, dan kinerja antar cabang menjadi tantangan utama. Tanpa visibilitas terpusat, keputusan sering terlambat 1–2 minggu.",
    });
  }

  // Potensi fraud kasir: hanya jika volume > 50 transaksi/hari
  if (txPerDay > 50) {
    risks.push("Potensi fraud kasir");
    if (pains.includes("fraud-risk") || txPerDay >= 200) {
      insights.push({
        level: "critical",
        title: "Risiko kebocoran kasir meningkat seiring volume transaksi",
        detail: `Dengan estimasi ${txPerDay.toLocaleString("id-ID")} transaksi per hari, tanpa audit trail dan hak akses berlapis, satu kasir nakal bisa mengikis profit secara konsisten. Sistem dengan kontrol berbasis peran menutup celah ini.`,
      });
    }
  }

  // Manajemen piutang B2B: hanya jika user pilih kanal B2B ATAU pakai tempo
  if (channels.includes("b2b") || payments.includes("tempo")) {
    risks.push("Manajemen piutang B2B");
    insights.push({
      level: "warning",
      title: "Penjualan B2B butuh perlakuan keuangan yang berbeda",
      detail:
        "Tempo, piutang, dan aging report adalah kebutuhan unik B2B. Mengelolanya di Excel berisiko terhadap arus kas Anda.",
    });
  }

  // Closing & laporan lambat: hanya jika omzet > Rp 200 jt/bln ATAU cabang > 3
  if (revenueMid > 200 || branchCount > 3) {
    if (pains.includes("manual-report") || pains.includes("slow-closing")) {
      risks.push("Closing & laporan lambat");
      insights.push({
        level: "info",
        title: "Laporan manual = blind spot strategis",
        detail:
          "Pada skala bisnis Anda, tutup buku yang lambat menunda evaluasi bulanan dan memperlambat respons terhadap perubahan pasar. Otomatisasi laporan adalah quick-win paling tinggi ROI.",
      });
    }
  }

  // Kebocoran stok: dari pain point langsung
  if (pains.includes("stock-mismatch")) {
    risks.push("Kebocoran stok & shrinkage");
    insights.push({
      level: "critical",
      title: "Selisih stok adalah pembocor margin yang paling sering tidak disadari",
      detail:
        "Bisnis retail rata-rata kehilangan 1–3% omzet karena stock mismatch. Ini muncul dari proses penerimaan, retur, dan adjustment yang tidak terkontrol.",
    });
  }

  // Tanpa real-time
  if (pains.includes("no-realtime")) {
    risks.push("Keputusan operasional terlambat");
    insights.push({
      level: "warning",
      title: "Tanpa data real-time, keputusan jadi reaktif",
      detail:
        "Anda tidak bisa merespons tren cepat, stok kritis, atau performa kasir tanpa dashboard yang hidup. Ini batas pertama yang biasanya menahan pertumbuhan.",
    });
  }

  // Multi-channel: hanya jika user pilih > 1 kanal
  if (pains.includes("multi-channel") && channels.length > 1) {
    risks.push("Inefisiensi sinkronisasi kanal");
    insights.push({
      level: "warning",
      title: "Multi-channel tanpa integrasi = pekerjaan ganda",
      detail: `Dengan ${channels.length} kanal aktif, tim Anda kemungkinan menghabiskan waktu signifikan untuk update stok manual antar marketplace. Otomatisasi sinkronisasi mengembalikan kapasitas tim untuk hal strategis.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      level: "info",
      title: "Operasional Anda relatif terkendali",
      detail:
        "Skala bisnis Anda saat ini memungkinkan implementasi sistem yang ringan namun rapi — fokus pada fondasi yang bisa tumbuh bersama bisnis.",
    });
  }

  // dedupe risks
  const uniqRisks = Array.from(new Set(risks));
  return { insights, risks: uniqRisks };
}

// ─────────────────────────────────────────────────────────────
// Rationale — narasi spesifik berbasis data input
// ─────────────────────────────────────────────────────────────

function buildRationale(
  tier: Tier,
  answers: Record<string, unknown>,
): string {
  const branchCount = branchCountFromAnswer(answers.branches);
  const branchLabel = labelFor("branches", answers.branches);
  const txLabel = labelFor("transactions", answers.transactions).toLowerCase();
  const channels = (answers.channels as string[]) ?? [];
  const channelCount = channels.length;
  const revenueLabel = labelFor("revenue", answers.revenue).toLowerCase();
  const current = labelFor("currentSystem", answers.currentSystem).toLowerCase();

  const branchPart =
    branchCount > 1
      ? `${branchLabel}`
      : `1 lokasi`;
  const channelPart =
    channelCount > 1 ? `${channelCount} kanal penjualan aktif` : `kanal tunggal`;

  switch (tier) {
    case "STARTER":
      return `Dengan ${branchPart}, volume ${txLabel}, dan operasional saat ini menggunakan ${current}, Anda berada di titik di mana POS modern sudah cukup memberi lompatan besar. Sistem Starter membereskan pencatatan, stok, dan laporan tanpa overhead implementasi panjang.`;
    case "PROFESSIONAL":
      return `Dengan ${branchPart}, volume ${txLabel}, omzet ${revenueLabel}, dan ${channelPart}, Anda berada di titik di mana spreadsheet dan POS sederhana mulai menahan pertumbuhan — tapi belum butuh ERP penuh. Sistem Professional memberikan sinkronisasi multi-cabang dan dashboard real-time tanpa overhead implementasi 6 bulan.`;
    case "BUSINESS":
      return `Dengan ${branchPart}, volume ${txLabel}, omzet ${revenueLabel}, dan ${channelPart}, kompleksitas operasional Anda sudah menuntut konsolidasi laporan lintas cabang dan kontrol margin yang rapi. Sistem Business memberi Anda visibilitas eksekutif tanpa biaya dan risiko ERP enterprise.`;
    case "ENTERPRISE":
      return `Dengan ${branchPart}, volume ${txLabel}, omzet ${revenueLabel}, dan ${channelPart} (termasuk B2B/distribusi), bisnis Anda menuntut otomatisasi lintas departemen dan konsolidasi multi-entitas. Sistem Enterprise dirancang untuk skala ini — dengan dedicated team dan SLA support.`;
  }
}

// ─────────────────────────────────────────────────────────────
// Growth path
// ─────────────────────────────────────────────────────────────

function buildGrowthPath(tier: Tier): GrowthStep[] {
  const next = TIER_ORDER[Math.min(TIER_ORDER.length - 1, TIER_ORDER.indexOf(tier) + 1)];
  const tierInfo = TIERS[tier];
  const nextInfo = TIERS[next];
  const midNow = Math.round((tierInfo.priceMin + tierInfo.priceMax) / 2);
  const upgradeDelta = Math.max(
    15,
    Math.round((nextInfo.priceMin - tierInfo.priceMax) / 2 + 20),
  );

  return [
    {
      horizon: "Sekarang",
      tier,
      label: tierInfo.name,
      invest: `Rp ${midNow} jt`,
      detail: "Implementasi inti & onboarding",
    },
    {
      horizon: "6 bulan",
      tier,
      label: `${tierInfo.name}+`,
      invest: `+ Rp 15–25 jt`,
      detail: "Tambah modul: BI, integrasi marketplace, custom report",
    },
    {
      horizon: "12–18 bulan",
      tier: next,
      label: nextInfo.name,
      invest: `+ Rp ${upgradeDelta}–${upgradeDelta + 30} jt`,
      detail: tier === "ENTERPRISE" ? "Ekspansi modul & integrasi lanjutan" : "Upgrade inkremental ke tier berikutnya",
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// Main analyze
// ─────────────────────────────────────────────────────────────

export function analyze(answers: Record<string, unknown>): AnalysisResult {
  const score = computeScore(answers);
  const max = maxPossibleScore();
  const rawTier = tierFromScore(score, max);

  const revenueMid = revenueMidFromAnswer(answers.revenue);
  const branchCount = branchCountFromAnswer(answers.branches);

  // Affordability check on raw tier
  const rawAfford = buildAffordability(rawTier, revenueMid);
  const finalTier = rawAfford.forcedDown ? rawAfford.forcedDown.to : rawTier;

  // Recompute affordability message for the final tier (ratio reflects actual recommendation)
  const affordability =
    finalTier === rawTier ? rawAfford : { ...buildAffordability(finalTier, revenueMid), forcedDown: rawAfford.forcedDown };

  const { insights, risks } = buildInsights(answers);
  const rationale = buildRationale(finalTier, answers);
  const growthPath = buildGrowthPath(finalTier);

  return {
    score,
    maxScore: max,
    tier: finalTier,
    tierInfo: TIERS[finalTier],
    rawTier,
    summary: {
      businessName: (answers.businessName as string) || "Bisnis Anda",
      branches: labelFor("branches", answers.branches),
      branchCount,
      transactions: labelFor("transactions", answers.transactions),
      channels: Array.isArray(answers.channels)
        ? (answers.channels as string[]).map((v) => labelFor("channels", [v]))
        : [],
      revenue: labelFor("revenue", answers.revenue),
      revenueMid,
    },
    insights,
    riskAreas: risks,
    affordability,
    growthPath,
    rationale,
  };
}

export function isAnswered(q: Question, value: unknown): boolean {
  if (!q.required) return true;
  if (q.type === "multiple") return Array.isArray(value) && value.length > 0;
  if (q.type === "text") return typeof value === "string" && value.trim().length > 0;
  if (q.type === "number") return typeof value === "number" && !Number.isNaN(value);
  return value !== undefined && value !== null && value !== "";
}
