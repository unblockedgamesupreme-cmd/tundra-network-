import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PROXY_PATH = "/api/proxy";

// Lightweight ad/tracker blocklist. Any hostname whose registrable suffix
// matches an entry is refused before we hit the upstream.
const AD_HOSTS = new Set([
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "googletagmanager.com",
  "googletagservices.com",
  "google-analytics.com",
  "adservice.google.com",
  "adnxs.com",
  "adsafeprotected.com",
  "adroll.com",
  "amazon-adsystem.com",
  "criteo.com",
  "criteo.net",
  "outbrain.com",
  "taboola.com",
  "moatads.com",
  "scorecardresearch.com",
  "quantserve.com",
  "hotjar.com",
  "mixpanel.com",
  "segment.io",
  "chartbeat.com",
  "facebook.net",
  "connect.facebook.net",
  "adsrvr.org",
  "rubiconproject.com",
  "pubmatic.com",
  "openx.net",
  "yieldmo.com",
  "media.net",
  "zedo.com",
  "revcontent.com",
  "mgid.com",
  "propellerads.com",
  "popads.net",
  "popcash.net",
  "onclickads.net",
  "adcash.com",
  "adf.ly",
  "2mdn.net",
  "serving-sys.com",
  "bidswitch.net",
  "casalemedia.com",
  "smartadserver.com",
  "advertising.com",
  "yieldlab.net",
  "sharethrough.com",
  "adform.net",
  "bluekai.com",
  "demdex.net",
  "everesttech.net",
  "krxd.net",
  "rlcdn.com",
]);

function isAdHost(hostname) {
  const h = hostname.toLowerCase();
  for (const bad of AD_HOSTS) {
    if (h === bad || h.endsWith("." + bad)) return true;
  }
  return false;
}

function errorPage(title, message, status = 502) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>html,body{margin:0;padding:0;height:100%;background:#0b1329;color:#e0f2fe;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center}
.box{max-width:520px;padding:32px;border:1px solid rgba(56,189,248,.3);border-radius:16px;background:rgba(15,23,42,.6)}
h1{margin:0 0 12px;font-size:22px;color:#7dd3fc}p{margin:0;color:#bae6fd;line-height:1.5;font-size:14px}</style>
</head><body><div class="box"><h1>${title}</h1><p>${message}</p></div></body></html>`;
  return new Response(html, {
    status: 200, // return 200 so the iframe renders our page (avoids browser error UI)
    headers: { "content-type": "text/html; charset=utf-8", "access-control-allow-origin": "*", "x-proxy-status": String(status) },
  });
}

function proxied(target) {
  return `${PROXY_PATH}?url=${encodeURIComponent(target)}`;
}

function resolveUrl(base, ref) {
  if (!ref) return null;
  const trimmed = ref.trim();
  if (!trimmed) return null;
  if (/^(data:|blob:|javascript:|mailto:|tel:|#)/i.test(trimmed)) return null;
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

function rewriteAttr(html, attr, base) {
  const re = new RegExp(`(\\s${attr}\\s*=\\s*)(["'])([\\s\\S]*?)\\2`, "gi");
  return html.replace(re, (_m, pre, q, val) => {
    if (val.includes('/api/proxy?url=')) return `${pre}${q}${val}${q}`;
    const abs = resolveUrl(base, val);
    if (!abs) return `${pre}${q}${val}${q}`;
    return `${pre}${q}${proxied(abs)}${q}`;
  });
}

function rewriteSrcset(html, base) {
  return html.replace(/(\ssrcset\s*=\s*)(["'])([\s\S]*?)\2/gi, (_m, pre, q, val) => {
    const parts = val.split(",").map((p) => {
      const seg = p.trim().split(/\s+/);
      if (seg[0] && seg[0].includes('/api/proxy?url=')) return p;
      const abs = resolveUrl(base, seg[0]);
      if (!abs) return p;
      seg[0] = proxied(abs);
      return seg.join(" ");
    });
    return `${pre}${q}${parts.join(", ")}${q}`;
  });
}

function rewriteCss(css, base) {
  css = css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (_m, q, val) => {
    if (val.includes('/api/proxy?url=')) return `url(${q}${val}${q})`;
    const abs = resolveUrl(base, val);
    if (!abs) return `url(${q}${val}${q})`;
    return `url(${q}${proxied(abs)}${q})`;
  });
  css = css.replace(/@import\s+(['"])([^'"]+)\1/gi, (_m, q, val) => {
    const abs = resolveUrl(base, val);
    if (!abs) return `@import ${q}${val}${q}`;
    return `@import ${q}${proxied(abs)}${q}`;
  });
  return css;
}

function rewriteHtml(html, base) {
  html = html.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, "");
  html = html.replace(/<meta[^>]+http-equiv=["']?x-frame-options["']?[^>]*>/gi, "");

  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (_m, open, css, close) => {
    return open + rewriteCss(css, base) + close;
  });

  for (const attr of ["href", "src", "action", "poster", "data-src", "data-href"]) {
    html = rewriteAttr(html, attr, base);
  }
  html = rewriteSrcset(html, base);

  const injection = `
<base href="${proxied(base)}">
<script>(function(){
  var PROXY = ${JSON.stringify(PROXY_PATH)};
  var BASE = ${JSON.stringify(base)};
  function abs(u){ try { return new URL(u, BASE).toString(); } catch(e){ return null; } }
  function wrap(u){ if(!u||typeof u!=='string') return u; if(u.indexOf(PROXY+'?')===0 || u.includes(PROXY+'?url=')) return u; if(/^(data:|blob:|javascript:|mailto:|tel:|#)/i.test(u)) return u; var a = abs(u); return a ? PROXY+'?url='+encodeURIComponent(a) : u; }
  var _fetch = window.fetch;
  window.fetch = function(input, init){
    try {
      if(typeof input==='string'){ input = wrap(input); }
      else if(input && input.url){ input = new Request(wrap(input.url), input); }
    } catch(e){}
    return _fetch.call(this, input, init);
  };
  var _open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m,u){ try { arguments[1] = wrap(u); } catch(e){} return _open.apply(this, arguments); };
  document.addEventListener('submit', function(e){
    var f = e.target;
    if(!f || !f.action) return;
    try { f.action = wrap(f.action); } catch(e){}
  }, true);
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if(!a) return;
    if(a.target==='_blank') return;
    var href = a.getAttribute('href');
    if(!href) return;
    if(/^(javascript:|mailto:|tel:|#)/i.test(href)) return;
    e.preventDefault();
    window.location.href = wrap(href);
  }, true);
})();</script>
`;
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, (m) => m + injection);
  } else {
    html = injection + html;
  }
  return html;
}

async function handleProxy(request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target) return errorPage("Missing URL", "No target URL was provided to the proxy.", 400);

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    try {
      targetUrl = new URL(/^https?:\/\//i.test(target) ? target : `https://${target}`);
    } catch {
      return errorPage("Invalid URL", "The URL you entered could not be parsed.", 400);
    }
  }
  if (!/^https?:$/.test(targetUrl.protocol)) {
    return errorPage("Blocked scheme", "Only http and https URLs are allowed.", 400);
  }

  if (isAdHost(targetUrl.hostname)) {
    // Ad/tracker blocked — return empty 204 so subresource requests just drop.
    return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "x-proxy-adblock": "1" } });
  }

  const fwdHeaders = {};
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (['host', 'origin', 'referer', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'connection', 'accept-encoding', 'upgrade'].includes(lower)) continue;
    fwdHeaders[lower] = value;
  }
  if (!fwdHeaders['user-agent']) {
    fwdHeaders['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }
  if (!fwdHeaders['accept']) {
    fwdHeaders['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8';
  }

  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
    const ct = request.headers.get("content-type");
    if (ct) fwdHeaders["content-type"] = ct;
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: fwdHeaders,
      body,
      redirect: "manual",
    });
  } catch (e) {
    return errorPage("Site unreachable", `Could not load <b>${targetUrl.hostname}</b>. It may be down, unresolvable, or blocking proxies.<br><br><small>${e.stack}</small>`, 502);
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    const loc = upstream.headers.get("location");
    if (loc) {
      const abs = resolveUrl(targetUrl.toString(), loc);
      if (abs) {
        return new Response(null, {
          status: upstream.status,
          headers: { location: proxied(abs) },
        });
      }
    }
  }

  const contentType = (upstream.headers.get("content-type") || "").toLowerCase();
  const outHeaders = new Headers();
  outHeaders.set("access-control-allow-origin", "*");
  const stripped = new Set([
    "content-security-policy",
    "content-security-policy-report-only",
    "x-frame-options",
    "frame-options",
    "cross-origin-opener-policy",
    "cross-origin-embedder-policy",
    "cross-origin-resource-policy",
    "strict-transport-security",
    "content-length",
    "content-encoding",
    "transfer-encoding",
  ]);
  for (const [k, v] of upstream.headers.entries()) {
    if (stripped.has(k.toLowerCase())) continue;
    outHeaders.set(k, v);
  }

  if (contentType.includes("text/html")) {
    const text = await upstream.text();
    const rewritten = rewriteHtml(text, targetUrl.toString());
    outHeaders.set("content-type", "text/html; charset=utf-8");
    return new Response(rewritten, { status: upstream.status, headers: outHeaders });
  }
  if (contentType.includes("text/css")) {
    const text = await upstream.text();
    const rewritten = rewriteCss(text, targetUrl.toString());
    outHeaders.set("content-type", "text/css; charset=utf-8");
    return new Response(rewritten, { status: upstream.status, headers: outHeaders });
  }

  return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Proxy Endpoint
  app.all("/api/proxy", async (req, res) => {
    try {
      const protocol = req.protocol || "http";
      const host = req.get("host") || "localhost:3000";
      const fullUrl = `${protocol}://${host}${req.originalUrl || req.url}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      let body;
      if (req.method !== "GET" && req.method !== "HEAD") {
        if (Buffer.isBuffer(req.body)) {
          body = req.body;
        } else if (typeof req.body === "string") {
          body = Buffer.from(req.body);
        } else if (req.body && Object.keys(req.body).length > 0) {
          body = Buffer.from(JSON.stringify(req.body));
        }
      }

      const webReq = new Request(fullUrl, {
        method: req.method,
        headers,
        body,
      });

      const webRes = await handleProxy(webReq);

      res.status(webRes.status);
      webRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (!webRes.body) {
        return res.end();
      }

      const arrayBuffer = await webRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error("Proxy error:", err);
      const errRes = errorPage("Server Error", err?.message || "An error occurred in proxy server", 500);
      res.status(errRes.status);
      errRes.headers.forEach((v, k) => res.setHeader(k, v));
      const html = await errRes.text();
      return res.send(html);
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
