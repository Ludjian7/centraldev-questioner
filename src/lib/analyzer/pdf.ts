import jsPDF from "jspdf";
import type { AnalysisResult, Tier } from "./scoring";

// Brand palette (RGB)
const PRIMARY: [number, number, number] = [15, 61, 46];
const ACCENT: [number, number, number] = [34, 197, 94];
const TEXT: [number, number, number] = [20, 30, 25];
const MUTED: [number, number, number] = [110, 120, 115];
const BORDER: [number, number, number] = [225, 230, 227];
const BG_SOFT: [number, number, number] = [246, 249, 247];

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN_X = 20;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// Data breakdown untuk PDF
const COST_BREAKDOWN: Record<Tier, { label: string; pct: number }[]> = {
  STARTER: [
    { label: "Analisa & Desain Sistem", pct: 15 },
    { label: "Development & Integrasi", pct: 55 },
    { label: "Training & Onboarding", pct: 15 },
    { label: "Garansi & Dukungan 3 Bulan", pct: 15 },
  ],
  PROFESSIONAL: [
    { label: "Analisa & Desain Sistem", pct: 15 },
    { label: "Development & Integrasi", pct: 50 },
    { label: "Manajemen Proyek", pct: 10 },
    { label: "Training & Onboarding", pct: 10 },
    { label: "Garansi & Dukungan 6 Bulan", pct: 15 },
  ],
  BUSINESS: [
    { label: "Analisa & Desain Sistem", pct: 12 },
    { label: "Development & Integrasi", pct: 48 },
    { label: "Manajemen Proyek Dedicated", pct: 12 },
    { label: "Training & SOP", pct: 13 },
    { label: "Garansi & Dukungan 12 Bulan", pct: 15 },
  ],
  ENTERPRISE: [
    { label: "Konsultasi & Arsitektur Enterprise", pct: 12 },
    { label: "Development & Custom Workflow", pct: 45 },
    { label: "Manajemen Proyek & Change", pct: 13 },
    { label: "Training Komprehensif", pct: 12 },
    { label: "Garansi & SLA 24/7 (12 Bulan)", pct: 18 },
  ],
};

function formatRupiah(n: number): string {
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1)} M`;
  return `Rp ${Math.round(n)} jt`;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "bisnis";
}

export function exportResultPdf(result: AnalysisResult, opts?: { returnBuffer?: boolean }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawCoverPage(doc, result);
  
  doc.addPage();
  drawAnalysisPage(doc, result);
  
  doc.addPage();
  drawSolutionPage(doc, result);
  
  doc.addPage();
  drawInvestmentPage(doc, result);
  
  doc.addPage();
  drawRoadmapPage(doc, result);

  drawFooters(doc, result);

  if (opts?.returnBuffer) return doc.output("arraybuffer");
  doc.save(`Proposal-Sistem-${slug(result.summary.businessName)}.pdf`);
  return undefined;
}

// ======================= PAGE DRAWERS =======================

function drawCoverPage(doc: jsPDF, result: AnalysisResult) {
  // Dark background top half
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, PAGE_H * 0.55, "F");

  // Logo mark
  doc.setFillColor(...ACCENT);
  doc.roundedRect(MARGIN_X, 30, 12, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("B", MARGIN_X + 6, 38.5, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(150, 180, 160);
  doc.text("CONFIDENTIAL BUSINESS PROPOSAL", MARGIN_X, 55);

  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  const title = doc.splitTextToSize("Rencana Transformasi Digital & Implementasi Sistem", CONTENT_W);
  doc.text(title, MARGIN_X, 70);

  doc.setFontSize(12);
  doc.setTextColor(190, 220, 200);
  doc.text(`Solusi Khusus Untuk:`, MARGIN_X, 110);
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(result.summary.businessName, MARGIN_X, 122);

  // Bottom half details
  const y = PAGE_H * 0.55 + 30;
  doc.setTextColor(...MUTED);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("TANGGAL PENYUSUNAN", MARGIN_X, y);
  
  const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(date, MARGIN_X, y + 6);

  doc.setTextColor(...MUTED);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("REKOMENDASI UTAMA", MARGIN_X + 80, y);
  
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(result.tierInfo.name, MARGIN_X + 80, y + 6);

  doc.setTextColor(...PRIMARY);
  doc.setFontSize(10);
  doc.text("Centraldev Technology", MARGIN_X, PAGE_H - 30);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Business System Consultant", MARGIN_X, PAGE_H - 24);
}

function drawAnalysisPage(doc: jsPDF, result: AnalysisResult) {
  let y = 30;
  
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("1. Executive Summary & Analisa", MARGIN_X, y);
  y += 12;

  // Business Profile Grid
  doc.setFillColor(...BG_SOFT);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 25, 2, 2, "F");
  
  const stats = [
    ["Cabang", result.summary.branches],
    ["Transaksi", result.summary.transactions],
    ["Omzet/Bulan", result.summary.revenue],
    ["Kanal", `${result.summary.channels.length} kanal`],
  ];
  
  let x = MARGIN_X + 5;
  stats.forEach(([label, val]) => {
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(label.toUpperCase(), x, y + 8);
    
    doc.setFontSize(11);
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(val, x, y + 16);
    x += CONTENT_W / 4;
  });
  y += 35;

  // Score
  doc.setFontSize(10);
  doc.text(`Indeks Kompleksitas Operasional: ${result.score} / ${result.maxScore}`, MARGIN_X, y);
  y += 5;
  doc.setFillColor(...BORDER);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 4, 2, 2, "F");
  const pct = Math.max(0, Math.min(1, result.score / Math.max(1, result.maxScore)));
  doc.setFillColor(...ACCENT);
  doc.roundedRect(MARGIN_X, y, CONTENT_W * pct, 4, 2, 2, "F");
  y += 15;

  // Rationale
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Mengapa Transformasi Dibutuhkan Sekarang?", MARGIN_X, y);
  y += 8;
  
  doc.setTextColor(...TEXT);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const rationaleLines = doc.splitTextToSize(result.rationale, CONTENT_W);
  doc.text(rationaleLines, MARGIN_X, y);
  y += rationaleLines.length * 5 + 10;

  // Risk Areas
  if (result.riskAreas.length > 0) {
    doc.setFillColor(254, 247, 237);
    doc.setDrawColor(251, 220, 180);
    doc.roundedRect(MARGIN_X, y, CONTENT_W, 30, 3, 3, "FD");
    
    doc.setTextColor(217, 119, 6); // Warning color
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Area Risiko Teridentifikasi (Tanpa Sistem Terpusat):", MARGIN_X + 6, y + 8);
    
    doc.setTextColor(...TEXT);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const riskText = result.riskAreas.join("  •  ");
    const riskLines = doc.splitTextToSize(riskText, CONTENT_W - 12);
    doc.text(riskLines, MARGIN_X + 6, y + 16);
  }
}

function drawSolutionPage(doc: jsPDF, result: AnalysisResult) {
  let y = 30;
  
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("2. Solusi yang Direkomendasikan", MARGIN_X, y);
  y += 15;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 140, 4, 4, "F");
  
  const innerMargin = MARGIN_X + 10;
  let cy = y + 15;

  doc.setFillColor(...ACCENT);
  doc.roundedRect(innerMargin, cy, 30, 7, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`TINGKAT ${result.tier}`, innerMargin + 15, cy + 5, { align: "center" });
  cy += 15;

  doc.setFontSize(22);
  doc.text(result.tierInfo.name, innerMargin, cy);
  cy += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 210);
  const descLines = doc.splitTextToSize(result.tierInfo.description, CONTENT_W - 20);
  doc.text(descLines, innerMargin, cy);
  cy += descLines.length * 5 + 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Fitur Utama & Deliverables:", innerMargin, cy);
  cy += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  result.tierInfo.features.forEach(f => {
    doc.setFillColor(...ACCENT);
    doc.circle(innerMargin + 2, cy - 1.5, 1.5, "F");
    const flines = doc.splitTextToSize(f, CONTENT_W - 25);
    doc.text(flines, innerMargin + 7, cy);
    cy += flines.length * 6;
  });

  // Footer of card
  cy = y + 120;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(innerMargin, cy, PAGE_W - innerMargin, cy);
  cy += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 210);
  doc.text("Estimasi Waktu Implementasi:", innerMargin, cy);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(result.tierInfo.implementation, innerMargin, cy + 6);
}

function drawInvestmentPage(doc: jsPDF, result: AnalysisResult) {
  let y = 30;
  
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("3. Transparansi Investasi & ROI", MARGIN_X, y);
  y += 12;

  // Breakdown Card
  doc.setFillColor(...BG_SOFT);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 75, 3, 3, "FD");
  
  doc.setTextColor(...TEXT);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Breakdown Komponen Investasi", MARGIN_X + 6, y + 10);
  
  let cy = y + 20;
  const breakdown = COST_BREAKDOWN[result.tier];
  const midInvest = result.affordability.midInvestment;
  
  breakdown.forEach(item => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    doc.text(item.label, MARGIN_X + 6, cy);
    
    const amt = Math.round(midInvest * item.pct / 100);
    doc.setFont("helvetica", "bold");
    doc.text(`~${formatRupiah(amt)}`, MARGIN_X + CONTENT_W - 6, cy, { align: "right" });
    
    cy += 4;
    doc.setFillColor(...BORDER);
    doc.roundedRect(MARGIN_X + 6, cy, CONTENT_W - 12, 2, 1, 1, "F");
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(MARGIN_X + 6, cy, (CONTENT_W - 12) * (item.pct / 100), 2, 1, 1, "F");
    cy += 8;
  });

  cy += 2;
  doc.setFontSize(14);
  doc.setTextColor(...PRIMARY);
  doc.text("Total Estimasi:", MARGIN_X + 6, cy);
  doc.text(result.tierInfo.priceRange, MARGIN_X + CONTENT_W - 6, cy, { align: "right" });
  y += 85;

  // ROI Cards
  const annualRev = result.affordability.estimatedAnnualRevenue;
  const monthlyRev = Math.round(annualRev / 12);
  const breakEven = monthlyRev > 0 ? Math.round(midInvest / monthlyRev) : null;
  const efficiency = Math.round(annualRev * 0.05);
  
  if (breakEven !== null) {
    const cardW = (CONTENT_W - 5) / 2;
    
    // Card 1
    doc.setFillColor(...BG_SOFT);
    doc.roundedRect(MARGIN_X, y, cardW, 35, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...MUTED);
    doc.text("SETARA BERAPA BULAN REVENUE?", MARGIN_X + 5, y + 8);
    doc.setFontSize(24);
    doc.setTextColor(...TEXT);
    doc.text(`${breakEven} bulan`, MARGIN_X + 5, y + 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const t1 = doc.splitTextToSize(`Setelah ${breakEven} bulan, sistem bekerja untuk Anda secara permanen.`, cardW - 10);
    doc.text(t1, MARGIN_X + 5, y + 26);

    // Card 2
    doc.setFillColor(235, 245, 240); // Soft green
    doc.roundedRect(MARGIN_X + cardW + 5, y, cardW, 35, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.text("ESTIMASI EFISIENSI TAHUN 1", MARGIN_X + cardW + 10, y + 8);
    doc.setFontSize(24);
    doc.setTextColor(...TEXT);
    doc.text(`~${formatRupiah(efficiency)}`, MARGIN_X + cardW + 10, y + 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const t2 = doc.splitTextToSize(`Berdasarkan penghematan 5% dari optimalisasi stok & laporan.`, cardW - 10);
    doc.text(t2, MARGIN_X + cardW + 10, y + 26);
    y += 45;
  }

  // Affordability Note
  if (result.affordability.status !== "healthy") {
    doc.setFillColor(254, 247, 237);
    doc.setDrawColor(251, 220, 180);
    const msg = doc.splitTextToSize(result.affordability.message, CONTENT_W - 10);
    doc.roundedRect(MARGIN_X, y, CONTENT_W, 10 + msg.length * 5, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    doc.text("Catatan Kelayakan Investasi:", MARGIN_X + 5, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(msg, MARGIN_X + 5, y + 11);
  }
}

function drawRoadmapPage(doc: jsPDF, result: AnalysisResult) {
  let y = 30;
  
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("4. Roadmap Pengembangan", MARGIN_X, y);
  y += 15;

  result.growthPath.forEach((step, i) => {
    doc.setFillColor(i === 0 ? 235 : 246, i === 0 ? 245 : 249, i === 0 ? 240 : 247); // highlight first step
    doc.roundedRect(MARGIN_X, y, CONTENT_W, 30, 2, 2, "F");
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ACCENT);
    doc.text(step.horizon.toUpperCase(), MARGIN_X + 6, y + 8);
    
    doc.setFontSize(14);
    doc.setTextColor(...TEXT);
    doc.text(step.label, MARGIN_X + 6, y + 16);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const detail = doc.splitTextToSize(step.detail, CONTENT_W - 12);
    doc.text(detail, MARGIN_X + 6, y + 22);
    
    y += 35;
  });

  // CTA
  y = Math.max(y, 180);
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 40, 3, 3, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Siap Memulai Transformasi?", MARGIN_X + CONTENT_W / 2, y + 12, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 210);
  doc.text("Proposal ini adalah draf awal. Mari jadwalkan konsultasi strategis", MARGIN_X + CONTENT_W / 2, y + 20, { align: "center" });
  doc.text("untuk mematangkan scope pekerjaan dan timeline spesifik bisnis Anda.", MARGIN_X + CONTENT_W / 2, y + 26, { align: "center" });
}

function drawFooters(doc: jsPDF, result: AnalysisResult) {
  const pages = doc.getNumberOfPages();
  for (let i = 2; i <= pages; i++) { // Skip cover page
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.line(MARGIN_X, PAGE_H - 15, PAGE_W - MARGIN_X, PAGE_H - 15);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(`Proposal Sistem - ${result.summary.businessName}`, MARGIN_X, PAGE_H - 10);
    doc.text(`Hal ${i} dari ${pages}`, PAGE_W - MARGIN_X, PAGE_H - 10, { align: "right" });
  }
}
