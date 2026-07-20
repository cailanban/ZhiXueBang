import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, requireUser, handleCORS, CORS_HEADERS, AuthError } from '../_shared/auth.ts';

const allowedTypes = new Set(['blog', 'website', 'bilibili', 'video', 'course', 'document']);

// P1-1: 域名信誉黑名单（已知垃圾/钓鱼/低质站点）
const DOMAIN_BLACKLIST = new Set([
  'spam-site.example.com',
  'phishing.example.com',
]);

// P1-1: 低信誉域名模式（可疑）
const LOW_REPUTATION_PATTERNS = [
  /\.tk$/i, /\.ml$/i, /\.ga$/i, /\.cf$/i, /\.gq$/i,  // 免费域名，常被滥用
  /\.xyz$/i, /\.top$/i, /\.work$/i, /\.cc$/i,
];

function safeUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host.endsWith('.local') || /^(127\.|10\.|192\.168\.|169\.254\.)/.test(host)) return null;
    return url;
  } catch { return null; }
}

function inferType(url: URL): string {
  if (url.hostname.includes('bilibili.com') || url.hostname === 'b23.tv') return 'bilibili';
  if (/youtube|youku|vimeo/.test(url.hostname)) return 'video';
  return 'website';
}

// P1-1: 域名信誉检查
function checkDomainReputation(hostname: string): { ok: boolean; reason?: string } {
  if (DOMAIN_BLACKLIST.has(hostname)) {
    return { ok: false, reason: 'domain_blacklisted' };
  }
  for (const pattern of LOW_REPUTATION_PATTERNS) {
    if (pattern.test(hostname)) {
      return { ok: false, reason: 'low_reputation_tld' };
    }
  }
  return { ok: true };
}

// P1-1: URL 可达性检查（HTTP HEAD 探测，带超时）
async function checkUrlReachable(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'ZhixueBang-ResourceChecker/1.0' },
    });
    clearTimeout(timeout);
    return { ok: res.ok || res.status < 500, status: res.status };
  } catch (e: any) {
    return { ok: false, error: e.message || 'unreachable' };
  }
}

serve(async req => {
  const cors = handleCORS(req); if (cors) return cors;
  try {
    const user = await requireUser(req);
    const supabase = createServiceClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return new Response(JSON.stringify({ error: 'FORBIDDEN' }), { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });

    const { query, topic, limit = 8 } = await req.json();
    if (!String(query || '').trim() || !String(topic || '').trim()) throw new Error('query and topic are required');
    const key = Deno.env.get('TAVILY_API_KEY');
    if (!key) return new Response(JSON.stringify({ error: 'SEARCH_PROVIDER_NOT_CONFIGURED', message: '请在 Edge Function Secrets 配置 TAVILY_API_KEY' }), { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });

    const response = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key, query: `${query} 学习 教程 课程`, search_depth: 'advanced', max_results: Math.min(Number(limit) || 8, 15), include_answer: false, include_raw_content: false }) });
    if (!response.ok) throw new Error(`search provider returned ${response.status}`);
    const payload = await response.json();

    // P1-1: 带质量校验的候选构建
    const validationResults: { url: string; passed: boolean; reason?: string }[] = [];
    const rows = [];
    for (const result of (payload.results || [])) {
      const url = safeUrl(String(result.url || ''));
      if (!url) {
        validationResults.push({ url: String(result.url || ''), passed: false, reason: 'invalid_url' });
        continue;
      }

      const resourceType = inferType(url);
      if (!allowedTypes.has(resourceType)) continue;

      // P1-1: 域名信誉检查
      const repCheck = checkDomainReputation(url.hostname);
      if (!repCheck.ok) {
        validationResults.push({ url: url.toString(), passed: false, reason: repCheck.reason });
        continue;
      }

      // P1-1: URL 可达性检查
      const reachable = await checkUrlReachable(url.toString());
      if (!reachable.ok) {
        validationResults.push({ url: url.toString(), passed: false, reason: `unreachable: ${reachable.error || reachable.status}` });
        continue;
      }

      validationResults.push({ url: url.toString(), passed: true });
      rows.push({
        title: String(result.title || url.hostname).slice(0, 180),
        summary: String(result.content || '').slice(0, 600),
        url: url.toString(),
        source_name: url.hostname.replace(/^www\./, ''),
        resource_type: resourceType,
        topic: String(topic).slice(0, 120),
        knowledge_points: [String(topic).slice(0, 120)],
        status: 'pending',
        discovery_source: 'web_agent',
      });
    }

    const passed = rows.length;
    const rejected = validationResults.filter(v => !v.passed).length;

    if (rows.length === 0) {
      return new Response(JSON.stringify({
        discovered: 0,
        candidates: [],
        validation: { passed, rejected, details: validationResults },
        message: rejected > 0 ? `${rejected} 个资源因质量校验未通过被过滤` : '未发现候选资源',
      }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabase.from('recommendation_resources').upsert(rows, { onConflict: 'url', ignoreDuplicates: true }).select('id,title,url,status');
    if (error) throw error;
    return new Response(JSON.stringify({
      discovered: data?.length || 0,
      candidates: data || [],
      validation: { passed, rejected, details: validationResults },
    }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 500;
    return new Response(JSON.stringify({ error: String(error) }), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
