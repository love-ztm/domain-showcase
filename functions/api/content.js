// Cloudflare Pages Function — /api/content
// Replaces Express API for Cloudflare Pages deployment
// Uses KV binding "SITE_CONTENT" with key "content"

const DEFAULT_CONTENT = {
  "domain": "oooooooooooo.cc.cd",
  "hero": {
    "title": "oooooooooooo.cc.cd",
    "subtitle": "Welcome to the Future",
    "description": "A next-generation digital identity hub for the modern tech era.",
    "particles": true,
    "logoUrl": ""
  },
  "about": {
    "title": "About Me",
    "bio": "Full-stack developer & digital architect. Building the web of tomorrow with cutting-edge technologies.",
    "avatar": "",
    "stats": [
      { "label": "Years Experience", "value": "8+" },
      { "label": "Projects", "value": "50+" },
      { "label": "Happy Clients", "value": "30+" }
    ]
  },
  "skills": [
    { "name": "React / Next.js", "level": 95, "icon": "⚛️" },
    { "name": "Node.js / Express", "level": 90, "icon": "🟩" },
    { "name": "TypeScript", "level": 88, "icon": "🔷" },
    { "name": "Python / Django", "level": 85, "icon": "🐍" },
    { "name": "Docker / K8s", "level": 80, "icon": "🐳" },
    { "name": "Cloud (AWS/GCP)", "level": 78, "icon": "☁️" }
  ],
  "projects": [
    {
      "title": "Neural Dashboard",
      "description": "AI-powered analytics platform with real-time data visualization and predictive insights.",
      "tech": ["React", "Python", "TensorFlow"],
      "url": "#",
      "image": ""
    },
    {
      "title": "CloudForge CLI",
      "description": "Developer toolkit for rapid cloud infrastructure provisioning and deployment automation.",
      "tech": ["Go", "Docker", "AWS"],
      "url": "#",
      "image": ""
    },
    {
      "title": "Quantum Chat",
      "description": "End-to-end encrypted messaging platform with decentralized architecture.",
      "tech": ["Rust", "WebSocket", "Crypto"],
      "url": "#",
      "image": ""
    }
  ],
  "links": [
    { "name": "GitHub", "url": "https://github.com", "icon": "github" },
    { "name": "Twitter", "url": "https://twitter.com", "icon": "twitter" },
    { "name": "LinkedIn", "url": "https://linkedin.com", "icon": "linkedin" },
    { "name": "Email", "url": "mailto:hello@oooooooooooo.cc.cd", "icon": "mail" }
  ],
  "footer": {
    "text": "© 2026 oooooooooooo.cc.cd — All rights reserved.",
    "showTime": true
  },
  "theme": {
    "primaryColor": "#00f0ff",
    "accentColor": "#7b2fff",
    "bgStyle": "dark"
  }
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Verify auth token for write operations
async function verifyAuth(env, request) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  try {
    const record = await env.SITE_CONTENT.get(`auth:${token}`, { type: 'json' });
    if (!record) return false;
    // Check 24h expiry
    if (Date.now() - record.created > 86400000) return false;
    return true;
  } catch (e) {
    return false;
  }
}

// GET /api/content — Read all content
export async function onRequestGet(context) {
  const { env } = context;
  let data = null;

  try {
    const raw = await env.SITE_CONTENT.get('content', { type: 'json' });
    data = raw || DEFAULT_CONTENT;
  } catch (e) {
    data = DEFAULT_CONTENT;
  }

  return new Response(JSON.stringify({ ok: true, data }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// PUT /api/content — Replace entire content
export async function onRequestPut(context) {
  const { env, request } = context;

  // Auth check
  if (!(await verifyAuth(env, request))) {
    return new Response(JSON.stringify({ ok: false, error: '未授权，请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return new Response(JSON.stringify({ ok: false, error: 'Request body must be a JSON object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    await env.SITE_CONTENT.put('content', JSON.stringify(body), {
      type: 'json',
    });

    return new Response(JSON.stringify({ ok: true, message: 'Content saved successfully' }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}

// PATCH /api/content/:section — Update a single section
export async function onRequestPatch(context) {
  const { env, request, params } = context;
  const section = params.section;

  // Auth check
  if (!(await verifyAuth(env, request))) {
    return new Response(JSON.stringify({ ok: false, error: '未授权，请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  try {
    const body = await request.json();
    let data;

    try {
      data = await env.SITE_CONTENT.get('content', { type: 'json' });
    } catch (e) {
      data = null;
    }

    if (!data) data = { ...DEFAULT_CONTENT };
    data[section] = body;

    await env.SITE_CONTENT.put('content', JSON.stringify(data), {
      type: 'json',
    });

    return new Response(JSON.stringify({ ok: true, message: `Section "${section}" updated` }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}

// OPTIONS — CORS preflight
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
