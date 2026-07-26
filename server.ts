import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper function to resolve and rewrite URLs for proxying
  function resolveAndProxyUrl(targetAttr: string, baseUrl: string): string {
    if (!targetAttr) return targetAttr;
    const trimmed = targetAttr.trim();
    if (
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("javascript:")
    ) {
      return targetAttr;
    }
    try {
      const absolute = new URL(trimmed, baseUrl).href;
      return `/api/proxy?url=${encodeURIComponent(absolute)}`;
    } catch {
      return targetAttr;
    }
  }

  // HTML rewriter
  function rewriteHtml(html: string, baseUrl: string): string {
    let result = html;

    // Insert <base> tag to help browser resolve any missed relative assets
    const baseTag = `<base href="${baseUrl}">`;

    // Rewrite href
    result = result.replace(/(href=["'])([^"']+)(["'])/gi, (match, p1, p2, p3) => {
      return `${p1}${resolveAndProxyUrl(p2, baseUrl)}${p3}`;
    });

    // Rewrite src
    result = result.replace(/(src=["'])([^"']+)(["'])/gi, (match, p1, p2, p3) => {
      return `${p1}${resolveAndProxyUrl(p2, baseUrl)}${p3}`;
    });

    // Rewrite action
    result = result.replace(/(action=["'])([^"']+)(["'])/gi, (match, p1, p2, p3) => {
      return `${p1}${resolveAndProxyUrl(p2, baseUrl)}${p3}`;
    });

    // Rewrite CSS url(...)
    result = result.replace(/url\(\s*["']?([^"'\)]+)["']?\s*\)/gi, (match, p1) => {
      return `url("${resolveAndProxyUrl(p1, baseUrl)}")`;
    });

    // Client-side script to intercept link clicks and form submits
    const clientScript = `
<script>
(function() {
  const BASE_URL = ${JSON.stringify(baseUrl)};
  function proxyUrl(urlStr) {
    if (!urlStr || urlStr.startsWith('data:') || urlStr.startsWith('blob:') || urlStr.startsWith('#') || urlStr.startsWith('javascript:')) {
      return urlStr;
    }
    try {
      const abs = new URL(urlStr, BASE_URL).href;
      return '/api/proxy?url=' + encodeURIComponent(abs);
    } catch(e) {
      return urlStr;
    }
  }

  document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a');
    if (anchor) {
      const rawHref = anchor.getAttribute('href');
      if (rawHref && !rawHref.startsWith('#') && !rawHref.startsWith('javascript:')) {
        e.preventDefault();
        window.location.href = proxyUrl(rawHref);
      }
    }
  }, true);

  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form) {
      const rawAction = form.getAttribute('action') || BASE_URL;
      form.action = proxyUrl(rawAction);
    }
  }, true);
})();
</script>
`;

    if (result.includes("<head>")) {
      result = result.replace("<head>", `<head>${baseTag}`);
    } else if (result.includes("<html>")) {
      result = result.replace("<html>", `<html><head>${baseTag}</head>`);
    }

    if (result.includes("</head>")) {
      result = result.replace("</head>", `${clientScript}</head>`);
    } else if (result.includes("</body>")) {
      result = result.replace("</body>", `${clientScript}</body>`);
    } else {
      result = clientScript + result;
    }

    return result;
  }

  // API Proxy Endpoint
  app.all("/api/proxy", async (req, res) => {
    const targetUrlStr = (req.query.url as string) || (req.body?.url as string);

    if (!targetUrlStr) {
      return res.status(400).send("Missing 'url' parameter");
    }

    let validTargetUrl: URL;
    try {
      let raw = targetUrlStr.trim();
      if (!/^https?:\/\//i.test(raw)) {
        raw = "https://" + raw;
      }
      validTargetUrl = new URL(raw);
    } catch (err) {
      return res.status(400).send("Invalid target URL provided");
    }

    try {
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      };

      const response = await fetch(validTargetUrl.href, {
        method: req.method === "POST" ? "POST" : "GET",
        headers,
        redirect: "follow",
      });

      const finalUrl = response.url || validTargetUrl.href;
      const contentType = response.headers.get("content-type") || "text/html";

      // Set CORS and frame headers relaxed
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.removeHeader("Content-Security-Policy-Report-Only");

      if (contentType.includes("text/html")) {
        const htmlText = await response.text();
        const rewrittenHtml = rewriteHtml(htmlText, finalUrl);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(rewrittenHtml);
      } else if (contentType.includes("text/css")) {
        const cssText = await response.text();
        const rewrittenCss = cssText.replace(
          /url\(\s*["']?([^"'\)]+)["']?\s*\)/gi,
          (match, p1) => {
            return `url("${resolveAndProxyUrl(p1, finalUrl)}")`;
          }
        );
        res.setHeader("Content-Type", "text/css; charset=utf-8");
        return res.status(200).send(rewrittenCss);
      } else {
        res.setHeader("Content-Type", contentType);
        const arrayBuffer = await response.arrayBuffer();
        return res.status(200).send(Buffer.from(arrayBuffer));
      }
    } catch (err: any) {
      console.error("Proxy error:", err);
      return res.status(502).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; background: #0b1329; color: #f0f9ff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: rgba(19,34,71,0.8); border: 1px solid rgba(56,189,248,0.3); border-radius: 16px; padding: 32px; max-width: 480px; }
            h2 { color: #f87171; margin-top: 0; }
            p { font-size: 14px; color: #94a3b8; }
            code { background: #070d1b; padding: 4px 8px; border-radius: 6px; color: #38bdf8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Proxy Request Failed</h2>
            <p>Could not load target page: <code>${targetUrlStr}</code></p>
            <p>${err?.message || "Unknown network error or target blocked connection."}</p>
          </div>
        </body>
        </html>
      `);
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
