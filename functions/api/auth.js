// Cloudflare Pages Function — /api/auth
// POST { username, password } → { ok, token }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { env, request } = context;

  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return new Response(JSON.stringify({ ok: false, error: '请输入用户名和密码' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const validUser = env.ADMIN_USER || 'lyzl8088';
    const validPass = env.ADMIN_PASS || '870204tt';

    if (username === validUser && password === validPass) {
      const token = generateToken();
      // Store token with 24h expiry
      await env.SITE_CONTENT.put(`auth:${token}`, JSON.stringify({
        user: username,
        created: Date.now(),
      }), { expirationTtl: 86400 });

      return new Response(JSON.stringify({ ok: true, token }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: '用户名或密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
