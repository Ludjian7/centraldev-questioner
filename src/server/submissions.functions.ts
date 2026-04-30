import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const SubmissionInput = z.object({
  business_name: z.string().min(1).max(255),
  answers: z.record(z.string(), z.unknown()),
  score: z.number().int().min(0).max(10000),
  max_score: z.number().int().min(1).max(10000),
  tier: z.enum(["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"]),
  risk_areas: z.array(z.string().max(255)).max(50),
});

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export const saveSubmission = createServerFn({ method: "POST" })
  .inputValidator((input) => SubmissionInput.parse(input))
  .handler(async ({ data }) => {
    const supabase = adminClient();
    const { data: row, error } = await supabase
      .from("submissions")
      .insert(data)
      .select("id")
      .single();
    if (error) {
      console.error("saveSubmission error:", error);
      return { ok: false as const, error: "Gagal menyimpan hasil asesmen." };
    }
    return { ok: true as const, id: row.id };
  });
