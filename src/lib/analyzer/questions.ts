// Question schema — single source of truth for the analyzer.
// Each question contributes weighted score to determine system tier.

export type QuestionType = "single" | "multiple" | "number" | "text";

export interface Option {
  value: string;
  label: string;
  description?: string;
  score?: number; // for single-choice
}

export interface Question {
  id: string;
  section: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  options?: Option[];
  // For multi-select: each chosen option contributes its score
  // For number: scoreFromNumber maps value -> score
  scoreFromNumber?: (n: number) => number;
  // Conditional: only show when predicate(answers) returns true
  showIf?: (answers: Record<string, unknown>) => boolean;
  // Free-text doesn't score
}

export const SECTIONS = [
  { id: "profil", label: "Profil Bisnis" },
  { id: "operasional", label: "Operasional" },
  { id: "keuangan", label: "Keuangan & Penjualan" },
  { id: "masalah", label: "Tantangan Saat Ini" },
  { id: "tujuan", label: "Tujuan & Prioritas" },
];

export const QUESTIONS: Question[] = [
  // ── PROFIL ───────────────────────────────────────────────
  {
    id: "businessName",
    section: "profil",
    type: "text",
    title: "Apa nama bisnis Anda?",
    subtitle: "Kami akan menyesuaikan analisa dengan profil bisnis Anda.",
    placeholder: "Contoh: Toko Maju Jaya",
    required: true,
  },
  {
    id: "industry",
    section: "profil",
    type: "single",
    title: "Industri apa yang paling menggambarkan bisnis Anda?",
    required: true,
    options: [
      { value: "retail-fashion", label: "Retail Fashion & Lifestyle", score: 2 },
      { value: "fnb", label: "F&B / Restoran / Cafe", score: 3 },
      { value: "grocery", label: "Grocery / Minimarket", score: 3 },
      { value: "elektronik", label: "Elektronik & Gadget", score: 2 },
      { value: "distribusi", label: "Distribusi / Grosir", score: 4 },
      { value: "lainnya", label: "Lainnya", score: 1 },
    ],
  },
  {
    id: "branches",
    section: "profil",
    type: "single",
    title: "Berapa cabang yang Anda kelola saat ini?",
    subtitle: "Termasuk gudang, outlet, dan toko online sebagai entitas terpisah.",
    required: true,
    options: [
      { value: "1", label: "1 lokasi", score: 0 },
      { value: "2-3", label: "2 – 3 lokasi", score: 3 },
      { value: "4-10", label: "4 – 10 lokasi", score: 5 },
      { value: "10+", label: "Lebih dari 10 lokasi", score: 7 },
    ],
  },
  {
    id: "employees",
    section: "profil",
    type: "single",
    title: "Berapa total karyawan operasional Anda?",
    required: true,
    options: [
      { value: "lt5", label: "Kurang dari 5", score: 0 },
      { value: "5-20", label: "5 – 20", score: 1 },
      { value: "20-50", label: "20 – 50", score: 3 },
      { value: "50+", label: "Lebih dari 50", score: 5 },
    ],
  },

  // ── OPERASIONAL ──────────────────────────────────────────
  {
    id: "transactions",
    section: "operasional",
    type: "single",
    title: "Berapa rata-rata transaksi penjualan per hari?",
    subtitle: "Total seluruh cabang dan kanal.",
    required: true,
    options: [
      { value: "lt50", label: "< 50 transaksi", score: 0 },
      { value: "50-200", label: "50 – 200 transaksi", score: 2 },
      { value: "200-1000", label: "200 – 1.000 transaksi", score: 4 },
      { value: "1000+", label: "> 1.000 transaksi", score: 6 },
    ],
  },
  {
    id: "skuCount",
    section: "operasional",
    type: "single",
    title: "Berapa banyak jenis produk (SKU) yang Anda kelola?",
    required: true,
    options: [
      { value: "lt100", label: "< 100 SKU", score: 0 },
      { value: "100-500", label: "100 – 500 SKU", score: 1 },
      { value: "500-2000", label: "500 – 2.000 SKU", score: 3 },
      { value: "2000+", label: "> 2.000 SKU", score: 5 },
    ],
  },
  {
    id: "channels",
    section: "operasional",
    type: "multiple",
    title: "Lewat kanal mana saja Anda berjualan?",
    subtitle: "Pilih semua yang relevan.",
    required: true,
    options: [
      { value: "offline", label: "Toko fisik / offline", score: 1 },
      { value: "marketplace", label: "Marketplace (Shopee, Tokopedia, dll)", score: 2 },
      { value: "social", label: "Social commerce (IG, TikTok, WA)", score: 2 },
      { value: "website", label: "Website / e-commerce sendiri", score: 2 },
      { value: "b2b", label: "Penjualan B2B / reseller", score: 3 },
    ],
  },
  {
    id: "interBranch",
    section: "operasional",
    type: "single",
    title: "Apakah ada perpindahan stok antar cabang/gudang?",
    showIf: (a) => a.branches !== "1",
    required: true,
    options: [
      { value: "tidak", label: "Tidak pernah", score: 0 },
      { value: "kadang", label: "Kadang-kadang", score: 2 },
      { value: "sering", label: "Sering / rutin", score: 4 },
    ],
  },

  // ── KEUANGAN ─────────────────────────────────────────────
  {
    id: "revenue",
    section: "keuangan",
    type: "single",
    title: "Berapa estimasi omzet bulanan bisnis Anda?",
    subtitle: "Informasi ini hanya untuk menyesuaikan rekomendasi.",
    required: true,
    options: [
      { value: "lt100", label: "< Rp 100 juta", score: 0 },
      { value: "100-500", label: "Rp 100 – 500 juta", score: 1 },
      { value: "500-2m", label: "Rp 500 juta – 2 miliar", score: 3 },
      { value: "2m+", label: "> Rp 2 miliar", score: 5 },
    ],
  },
  {
    id: "paymentMethods",
    section: "keuangan",
    type: "multiple",
    title: "Metode pembayaran apa yang Anda terima?",
    required: true,
    options: [
      { value: "cash", label: "Tunai", score: 0 },
      { value: "qris", label: "QRIS / e-wallet", score: 1 },
      { value: "edc", label: "Kartu debit / kredit (EDC)", score: 1 },
      { value: "transfer", label: "Transfer bank", score: 1 },
      { value: "tempo", label: "Tempo / piutang B2B", score: 3 },
    ],
  },
  {
    id: "invoiceVolume",
    section: "keuangan",
    type: "single",
    title: "Berapa banyak invoice B2B yang Anda terbitkan per bulan?",
    showIf: (a) => Array.isArray(a.paymentMethods) && (a.paymentMethods as string[]).includes("tempo"),
    required: true,
    options: [
      { value: "lt20", label: "< 20 invoice", score: 1 },
      { value: "20-100", label: "20 – 100 invoice", score: 2 },
      { value: "100+", label: "> 100 invoice", score: 4 },
    ],
  },

  // ── MASALAH ──────────────────────────────────────────────
  {
    id: "painPoints",
    section: "masalah",
    type: "multiple",
    title: "Tantangan apa yang paling sering Anda hadapi?",
    subtitle: "Pilih semua yang Anda alami secara rutin.",
    required: true,
    options: [
      { value: "stock-mismatch", label: "Stok di sistem tidak cocok dengan fisik", score: 3 },
      { value: "no-realtime", label: "Tidak tahu posisi stok / penjualan secara real-time", score: 3 },
      { value: "manual-report", label: "Laporan masih manual / pakai Excel", score: 2 },
      { value: "fraud-risk", label: "Sulit kontrol kasir & potensi kebocoran", score: 3 },
      { value: "slow-closing", label: "Tutup buku harian / bulanan lambat", score: 2 },
      { value: "multi-channel", label: "Sulit sinkronisasi antar kanal penjualan", score: 3 },
      { value: "no-issue", label: "Tidak ada masalah signifikan", score: 0 },
    ],
  },
  {
    id: "currentSystem",
    section: "masalah",
    type: "single",
    title: "Apa yang Anda gunakan saat ini untuk operasional?",
    required: true,
    options: [
      { value: "manual", label: "Manual / catatan & Excel", score: 3 },
      { value: "basic-pos", label: "POS sederhana", score: 1 },
      { value: "erp", label: "ERP / sistem terintegrasi", score: 0 },
      { value: "custom", label: "Sistem custom internal", score: 1 },
    ],
  },

  // ── TUJUAN ───────────────────────────────────────────────
  {
    id: "priorities",
    section: "tujuan",
    type: "multiple",
    title: "Apa prioritas utama Anda dalam 6 – 12 bulan ke depan?",
    required: true,
    options: [
      { value: "scale", label: "Membuka cabang baru / ekspansi", score: 2 },
      { value: "efficiency", label: "Meningkatkan efisiensi operasional", score: 1 },
      { value: "control", label: "Kontrol & visibilitas yang lebih baik", score: 2 },
      { value: "integration", label: "Integrasi multi-channel", score: 2 },
      { value: "automation", label: "Otomatisasi proses & laporan", score: 2 },
    ],
  },
  {
    id: "timeline",
    section: "tujuan",
    type: "single",
    title: "Kapan Anda berencana menerapkan sistem baru?",
    required: true,
    options: [
      { value: "asap", label: "Secepatnya (≤ 1 bulan)", score: 2 },
      { value: "1-3", label: "1 – 3 bulan ke depan", score: 1 },
      { value: "3-6", label: "3 – 6 bulan ke depan", score: 0 },
      { value: "explore", label: "Masih eksplorasi", score: 0 },
    ],
  },
  {
    id: "notes",
    section: "tujuan",
    type: "text",
    title: "Ada hal spesifik yang ingin Anda sampaikan?",
    subtitle: "Opsional — bisa berupa kebutuhan khusus, kendala, atau pertanyaan.",
    placeholder: "Tulis di sini...",
  },
];

export function visibleQuestions(answers: Record<string, unknown>): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}
