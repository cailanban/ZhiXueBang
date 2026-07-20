// chat-ai Edge Function — DeepSeek 通用对话（资源生成 / 通用问答）
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { messages, systemPrompt } = await req.json();

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    const dsMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...(messages || []),
    ];

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: dsMessages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    const dsData = await dsRes.json();
    if (!dsRes.ok) throw new Error(dsData.error?.message || 'DeepSeek API error');

    const content = dsData.choices?.[0]?.message?.content || '';
    return new Response(
      JSON.stringify({ content }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e), content: '' }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
