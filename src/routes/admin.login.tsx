import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Business System Analyzer" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/admin";
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.55]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke beranda
        </Link>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-elevated">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            Akses Admin
          </div>
          <h1 className="mt-4 text-2xl font-display font-semibold tracking-tight">
            Masuk ke dashboard konsultan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kami akan kirim tautan masuk ke email Anda. Tidak perlu password.
          </p>

          {sent ? (
            <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/5 p-5 text-sm">
              <div className="font-semibold text-foreground">Cek email Anda</div>
              <p className="mt-1 text-muted-foreground">
                Kami sudah kirim tautan masuk ke <strong>{email}</strong>. Klik tautan untuk login.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="mt-1.5 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anda@perusahaan.com"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
              >
                {loading ? "Mengirim..." : "Kirim tautan masuk"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
