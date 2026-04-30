import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function requireAdmin(token: string): Promise<
  { ok: true; sb: SupabaseClient; userId: string } | { ok: false; error: string }
> {
  if (!token) return { ok: false, error: "Tidak terautentikasi." };
  const sb = adminClient();
  const { data: userRes, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userRes.user) return { ok: false, error: "Sesi tidak valid." };
  const { data: roleRow } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userRes.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) return { ok: false, error: "Akun ini belum memiliki akses admin." };
  return { ok: true, sb, userId: userRes.user.id };
}

export const listSubmissions = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ token: z.string().min(10).max(4096) }).parse(i))
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.token);
    if (!auth.ok) return { ok: false as const, error: auth.error };
    const { data: rows, error } = await auth.sb
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, rows: rows ?? [] };
  });

export const deleteSubmission = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({ token: z.string().min(10).max(4096), id: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const auth = await requireAdmin(data.token);
    if (!auth.ok) return { ok: false as const, error: auth.error };
    const { error } = await auth.sb.from("submissions").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
