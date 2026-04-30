import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listSubmissions, deleteSubmission } from "@/server/admin.functions";
import {
  ArrowLeft,
  Download,
  LogOut,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Business System Analyzer" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

interface Row {
  id: string;
  business_name: string;
  answers: Record<string, unknown>;
  score: number;
  max_score: number;
  tier: "STARTER" | "PROFESSIONAL" | "BUSINESS" | "ENTERPRISE" | "BASIC" | "STANDARD" | "ADVANCED";
  risk_areas: string[];
  created_at: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<"ALL" | Row["tier"]>("ALL");
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/admin/login" });
        return;
      }
      setToken(data.session.access_token);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/admin/login" });
      else setToken(session.access_token);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    listSubmissions({ data: { token } })
      .then((res) => {
        if (res.ok) setRows(res.rows as Row[]);
        else setError(res.error);
      })
      .catch((e) => setError(String(e)));
  }, [token]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (tierFilter !== "ALL" && r.tier !== tierFilter) return false;
      if (q && !r.business_name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, q, tierFilter]);

  const stats = useMemo(() => {
    const total = rows?.length ?? 0;
    const by: Record<string, number> = {
      STARTER: 0,
      PROFESSIONAL: 0,
      BUSINESS: 0,
      ENTERPRISE: 0,
    };
    let sum = 0;
    rows?.forEach((r) => {
      // map legacy tiers to new ones for stats
      const mapped =
        r.tier === "BASIC"
          ? "STARTER"
          : r.tier === "STANDARD"
            ? "PROFESSIONAL"
            : r.tier === "ADVANCED"
              ? "ENTERPRISE"
              : r.tier;
      by[mapped] = (by[mapped] ?? 0) + 1;
      sum += r.score;
    });
    return { total, by, avg: total ? Math.round(sum / total) : 0 };
  }, [rows]);

  const onDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Hapus submission ini?")) return;
    const res = await deleteSubmission({ data: { token, id } });
    if (res.ok) {
      setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
      if (selected?.id === id) setSelected(null);
    } else {
      alert(res.error);
    }
  };

  const onExport = () => {
    if (!rows?.length) return;
    const headers = [
      "id",
      "created_at",
      "business_name",
      "tier",
      "score",
      "max_score",
      "risk_areas",
      "answers",
    ];
    const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.id,
          r.created_at,
          r.business_name,
          r.tier,
          r.score,
          r.max_score,
          r.risk_areas.join("; "),
          JSON.stringify(r.answers),
        ]
          .map(esc)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Beranda
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className="font-display text-sm font-semibold">Admin Dashboard</div>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
        <h1 className="text-3xl font-display font-semibold tracking-tight">
          Submissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua hasil asesmen yang masuk dari pengunjung.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
            {error.includes("admin") && (
              <p className="mt-2 text-xs text-muted-foreground">
                Akun Anda belum memiliki role admin. Hubungi pengelola sistem untuk diberikan akses.
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="Starter" value={stats.by.STARTER} />
          <Stat label="Professional" value={stats.by.PROFESSIONAL} />
          <Stat label="Business" value={stats.by.BUSINESS} />
          <Stat label="Enterprise" value={stats.by.ENTERPRISE} />
          <Stat label="Skor rata-rata" value={stats.avg} icon={<TrendingUp className="h-3.5 w-3.5" />} />
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama bisnis..."
                className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="ALL">Semua tier</option>
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="BUSINESS">Business</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
          <button
            onClick={onExport}
            disabled={!rows?.length}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Bisnis</th>
                <th className="px-4 py-3 text-left">Tier</th>
                <th className="px-4 py-3 text-left">Skor</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows === null && !error && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>
              )}
              {rows && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada submission.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{r.business_name}</td>
                  <td className="px-4 py-3"><TierBadge tier={r.tier} /></td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{r.score}/{r.max_score}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setSelected(r)} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-secondary">Detail</button>
                      <button onClick={() => onDelete(r.id)} className="rounded-lg border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Detail submission</div>
                <h2 className="mt-1 text-xl font-display font-semibold">{selected.business_name}</h2>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <TierBadge tier={selected.tier} />
                  <span>Skor {selected.score}/{selected.max_score}</span>
                  <span>{new Date(selected.created_at).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {selected.risk_areas.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Area risiko</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.risk_areas.map((r) => (
                    <span key={r} className="rounded-full border border-border bg-background px-3 py-1 text-xs">{r}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Jawaban</div>
              <pre className="rounded-xl border border-border bg-background p-4 text-xs overflow-x-auto">
{JSON.stringify(selected.answers, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-1 text-2xl font-display font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Row["tier"] }) {
  const cls =
    tier === "ENTERPRISE" || tier === "ADVANCED"
      ? "bg-primary text-primary-foreground"
      : tier === "BUSINESS"
        ? "bg-accent text-accent-foreground"
        : tier === "PROFESSIONAL" || tier === "STANDARD"
          ? "bg-accent/20 text-primary"
          : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cls}`}>{tier}</span>;
}
