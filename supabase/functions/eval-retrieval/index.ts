/**
 * eval-retrieval --- retrieval evaluation Edge Function
 *
 * Reads eval queries from retrieval_eval_queries table.
 * Computes: Recall@K, Precision@K, MRR, NDCG@K.
 * Supports auto_annotate mode for first-time setup.
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createServiceClient, requireUser, handleCORS, CORS_HEADERS, AuthError } from "../_shared/auth.ts";
import { createCostTracker, accumulateDailyCost } from "../_shared/observability.ts";

const headers = { ...CORS_HEADERS, "Content-Type": "application/json" };

// --- Metric functions ---
function recallAtK(relevant: Set<string>, retrieved: string[], k: number): number {
  if (relevant.size === 0) return 0;
  const hits = retrieved.slice(0, k).filter((id) => relevant.has(id)).length;
  return hits / relevant.size;
}

function precisionAtK(relevant: Set<string>, retrieved: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  if (topK.length === 0) return 0;
  return topK.filter((id) => relevant.has(id)).length / topK.length;
}

function mrr(queries: { relevant: Set<string>; retrieved: string[] }[]): number {
  let sum = 0;
  for (const q of queries) {
    for (let i = 0; i < q.retrieved.length; i++) {
      if (q.relevant.has(q.retrieved[i])) { sum += 1 / (i + 1); break; }
    }
  }
  return queries.length > 0 ? sum / queries.length : 0;
}

function ndcgAtK(relevant: Set<string>, retrieved: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    if (relevant.has(topK[i])) dcg += 1 / Math.log2(i + 2);
  }
  const idealCount = Math.min(relevant.size, k);
  let idcg = 0;
  for (let i = 0; i < idealCount; i++) idcg += 1 / Math.log2(i + 2);
  return idcg > 0 ? dcg / idcg : 0;
}

// --- Main handler ---
serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const cost = createCostTracker();

  try {
    const supabase = createServiceClient();

    // 先尝试用户 JWT，失败后验证是否为 service_role key（管理员模式）
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    let user: { id: string; email?: string };
    if (authHeader && authHeader === serviceRoleKey) {
      user = { id: "admin", email: "admin@system" };
    } else {
      user = await requireUser(req);
    }

    if (req.method === "GET") {
      const { data: queries, error } = await supabase
        .from("retrieval_eval_queries")
        .select("id,query,category,difficulty,relevant_ids")
        .order("id");

      if (error) throw error;

      const total = queries?.length || 0;
      const annotated = queries?.filter((q: any) => q.relevant_ids?.length > 0).length || 0;

      return new Response(JSON.stringify({
        total,
        annotated,
        annotation_rate: total > 0 ? Math.round((annotated / total) * 100) : 0,
        queries: queries?.map((q: any) => ({
          id: q.id,
          query: q.query,
          category: q.category,
          difficulty: q.difficulty,
          annotated: (q.relevant_ids?.length || 0) > 0,
          relevant_count: q.relevant_ids?.length || 0,
        })),
      }), { headers });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const ks: number[] = body.k_values || [1, 3, 5, 10];

      const { data: evalQueries, error: fetchErr } = await supabase
        .from("retrieval_eval_queries")
        .select("*")
        .order("id");

      if (fetchErr) throw fetchErr;

      if (!evalQueries || evalQueries.length === 0) {
        return new Response(JSON.stringify({
          error: "NO_EVAL_QUERIES",
          message: "Run 00022 migration first, then upload knowledge and annotate relevant_ids.",
        }), { status: 400, headers });
      }

      const annotated = evalQueries.filter((q: any) => (q.relevant_ids?.length || 0) > 0);
      const unannotated = evalQueries.filter((q: any) => (q.relevant_ids?.length || 0) === 0);

      if (body.auto_annotate && unannotated.length > 0) {
        for (const q of unannotated) {
          try {
            await supabase.rpc("self_annotate_eval_query", {
              p_query_id: q.id,
              p_top_k: body.annotation_top_k || 3,
            });
          } catch { /* skip if no wiki entries */ }
        }
      }

      const perQuery: Record<string, unknown>[] = [];
      let rpcCalls = 0;

      for (const eq of evalQueries) {
        const relevant = new Set(eq.relevant_ids || []);

        const t0 = Date.now();
        const { data: raw, error } = await supabase.rpc("hybrid_knowledge_search", {
          p_user_id: user.id,
          p_query: eq.query,
          p_query_embedding: null,
          p_limit: Math.max(...ks),
        });
        const elapsed = Date.now() - t0;
        rpcCalls++;

        if (error) {
          perQuery.push({ query: eq.query, error: error.message, elapsed_ms: elapsed });
          continue;
        }

        const retrieved = (raw || []).map((r: any) => r.wiki_entry_id || r.result_id).filter(Boolean);

        const metrics: Record<string, number> = {};
        for (const k of ks) {
          metrics["rec@" + k] = recallAtK(relevant, retrieved, k);
          metrics["precision@" + k] = precisionAtK(relevant, retrieved, k);
          metrics["ndcg@" + k] = ndcgAtK(relevant, retrieved, k);
        }

        perQuery.push({
          query: eq.query,
          category: eq.category,
          difficulty: eq.difficulty,
          relevant_count: eq.relevant_ids?.length || 0,
          retrieved_count: retrieved.length,
          elapsed_ms: elapsed,
          ...metrics,
        });
      }

      const validQueries = perQuery.filter((q) => !q.error);
      const aggregated: Record<string, number> = {};
      for (const k of ks) {
        aggregated["rec@" + k] = validQueries.reduce((s, q) => s + (q["rec@" + k] as number), 0) / (validQueries.length || 1);
        aggregated["precision@" + k] = validQueries.reduce((s, q) => s + (q["precision@" + k] as number), 0) / (validQueries.length || 1);
        aggregated["ndcg@" + k] = validQueries.reduce((s, q) => s + (q["ndcg@" + k] as number), 0) / (validQueries.length || 1);
      }
      aggregated["mrr"] = mrr(
        validQueries.map((q) => {
          const eq = evalQueries.find((e: any) => e.query === q.query);
          return { relevant: new Set(eq?.relevant_ids || []), retrieved: [] };
        }),
      );

      const byDifficulty: Record<string, Record<string, number>> = {};
      for (const diff of ["easy", "medium", "hard"]) {
        const group = perQuery.filter((q) => q.difficulty === diff && !q.error);
        if (group.length === 0) continue;
        byDifficulty[diff] = {};
        for (const k of ks) {
          byDifficulty[diff]["rec@" + k] = group.reduce((s, q) => s + (q["rec@" + k] as number), 0) / group.length;
        }
      }

      const c = cost.getCost();
      accumulateDailyCost("eval-retrieval", c);

      return new Response(JSON.stringify({
        dataset_size: evalQueries.length,
        annotated: annotated.length,
        unannotated: unannotated.length,
        evaluated: validQueries.length,
        errors: perQuery.length - validQueries.length,
        k_values: ks,
        aggregated,
        by_difficulty: byDifficulty,
        per_query: perQuery,
        observability: { cost: c, rpc_calls: rpcCalls },
        note: unannotated.length > 0
          ? `${unannotated.length} queries not annotated. Use auto_annotate:true or annotate manually.`
          : undefined,
      }), { headers });
    }

    return new Response(JSON.stringify({ error: "NOT_FOUND" }), { status: 404, headers });
  } catch (e: any) {
    if (e instanceof AuthError) return new Response(JSON.stringify({ error: e.message }), { status: e.status, headers });
    console.error("eval-retrieval error:", e.message);
    return new Response(JSON.stringify({ error: e.message || "INTERNAL_ERROR" }), { status: 500, headers });
  }
});