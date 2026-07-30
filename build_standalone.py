import re
import os
import subprocess
import xml.etree.ElementTree as ET

def build_svg():
    print("1. Reading public/singlefile/index.html...")
    with open("public/singlefile/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 2. Compile Tailwind CSS using @tailwindcss/cli
    print("2. Compiling Tailwind CSS using @tailwindcss/cli...")
    input_css_content = """@import 'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Press+Start+2P&family=JetBrains+Mono:wght@400;600&display=swap';
@import 'tailwindcss';

@theme {
  --color-slate-850: #0f172a;
  --color-slate-950: #070d1b;

  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-arcade: 'Press Start 2P', cursive;
  --font-blackops: 'Black Ops One', cursive;
  --font-serif: 'Instrument Serif', serif;
}
"""
    with open("temp_tailwind_in.css", "w", encoding="utf-8") as f:
        f.write(input_css_content)

    res = subprocess.run(
        ["npx", "@tailwindcss/cli", "-i", "temp_tailwind_in.css", "--content", "public/singlefile/index.html", "-o", "temp_tailwind_out.css"],
        capture_output=True, text=True
    )
    if res.returncode != 0:
        print("Tailwind CLI Error:", res.stderr)
        return False

    with open("temp_tailwind_out.css", "r", encoding="utf-8") as f:
        compiled_tailwind_css = f.read()

    # Clean up temp css files
    os.remove("temp_tailwind_in.css")
    os.remove("temp_tailwind_out.css")

    # Custom extra CSS from index.html head
    custom_head_css = """
        :root {
            --frost-bg: #0b1329;
            --frost-card: rgba(19, 34, 71, 0.7);
            --frost-border: rgba(56, 189, 248, 0.25);
            --frost-cyan: #38bdf8;
            --frost-purple: #c084fc;
        }

        body {
            background: #050914;
            color: #f0f9ff;
            min-height: 100vh;
            overflow-x: hidden;
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
        }

        body::before {
            content: "";
            position: fixed;
            inset: 0;
            z-index: -2;
            background: url('https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=3840&auto=format&fit=crop&q=95') center center / cover no-repeat fixed;
        }

        body::after {
            content: "";
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background:
                radial-gradient(ellipse at 30% 0%, rgba(56,189,248,0.08), transparent 60%),
                linear-gradient(180deg, rgba(5,9,20,0.55) 0%, rgba(5,9,20,0.72) 60%, rgba(5,9,20,0.88) 100%);
        }

        .frost-glass {
            background: rgba(11, 19, 41, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }

        .frost-card {
            background: rgba(19, 34, 71, 0.6);
            border: 1px solid var(--frost-border);
            backdrop-filter: blur(8px);
        }

        .frost-card:hover {
            border-color: rgba(56, 189, 248, 0.5);
            box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.2);
        }

        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #070d1b;
        }
        ::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 4px;
            border: 1px solid rgba(56, 189, 248, 0.2);
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #38bdf8;
        }

        @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s infinite ease-in-out;
        }
"""

    full_css = compiled_tailwind_css + "\n" + custom_head_css

    print("3. Replacing Tailwind CDN script and config in HTML with compiled CSS...")
    # Remove DOCTYPE
    html = re.sub(r"<!DOCTYPE[^>]*>", "", html, flags=re.IGNORECASE)

    # Remove external tailwind CDN script tag and tailwind.config script tag
    html = re.sub(r'<script\s+src="https:\/\/cdn\.tailwindcss\.com"><\/script>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<script>[\s\S]*?tailwind\.config\s*=[\s\S]*?<\/script>', '', html, flags=re.IGNORECASE)

    # Remove existing <style> tag in head if any (we will replace with full_css)
    html = re.sub(r'<style>[\s\S]*?<\/style>', '', html, flags=re.IGNORECASE)

    # Inject compiled full_css inside head
    style_element = f"<style><![CDATA[\n{full_css}\n]]></style>"
    if "</head>" in html:
        html = html.replace("</head>", f"{style_element}\n</head>", 1)
    else:
        html = style_element + html

    print("4. Processing XML self-closing tags and boolean attributes...")
    # Self-close void tags
    def self_close(m):
        tag = m.group(0)
        if tag.endswith("/>"):
            return tag
        return tag[:-1] + " />"

    void_regex = r"<(meta|link|input|img|br|hr|source|param|embed|track|area)(?:\s+[^>]*)?>"
    html = re.sub(void_regex, self_close, html, flags=re.IGNORECASE)

    # Fix valueless attributes OUTSIDE quotes
    def fix_tag_attributes(m):
        tag_content = m.group(0)
        if tag_content.lower().startswith("<script") or tag_content.lower().startswith("<style"):
            return tag_content
        
        valueless = [
            "crossorigin", "allowfullscreen", "autofocus", "required", "disabled",
            "checked", "readonly", "multiple", "selected", "defer", "async",
            "novalidate", "playsinline", "loop", "controls", "autoplay", "muted"
        ]
        for attr in valueless:
            pattern = r"(\s)(" + attr + r")(?=\s|>|\/)"
            parts = re.split(r"(\"[^\"]*\"|\'[^\']*\')", tag_content)
            new_parts = []
            for part in parts:
                if part.startswith('"') or part.startswith("'"):
                    new_parts.append(part)
                else:
                    part = re.sub(pattern, r'\1\2="\2"', part, flags=re.IGNORECASE)
                    new_parts.append(part)
            tag_content = "".join(new_parts)
        return tag_content

    html = re.sub(r"<[^>]+>", fix_tag_attributes, html)

    print("5. Wrapping <script> blocks in CDATA...")
    # Remove existing CDATA from scripts to avoid nesting
    def wrap_script(m):
        attrs = m.group(1)
        content = m.group(2)
        if "src=" in attrs and not content.strip():
            return m.group(0)
        # Strip existing CDATA wrappers inside content
        clean_content = content.replace("<![CDATA[", "").replace("]]>", "")
        return f"<script{attrs}><![CDATA[{clean_content}]]></script>"

    html = re.sub(r"<script([^>]*)>([\s\S]*?)<\/script>", wrap_script, html, flags=re.IGNORECASE)

    print("6. Replacing entities & ampersands...")
    html = html.replace("&middot;", "&#183;")
    html = html.replace("&bull;", "&#8226;")
    html = html.replace("&nbsp;", "&#160;")
    html = html.replace("&copy;", "&#169;")
    html = html.replace("&mdash;", "&#8212;")
    html = html.replace("&ndash;", "&#8211;")
    html = html.replace("&hellip;", "&#8230;")

    html = re.sub(r"&(?!([a-zA-Z0-9]+|#[0-9]+|#x[a-fA-F0-9]+);)", "&amp;", html)

    # Ensure <html> has xmlns and explicit styles
    if "<html" in html:
        html = re.sub(r"<html([^>]*)>", r'<html\1 xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;min-height:100vh;margin:0;padding:0;background:#050914;">', html, count=1)
        html = re.sub(r'xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"\s+xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"', 'xmlns="http://www.w3.org/1999/xhtml"', html)
    else:
        html = f'<html xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;min-height:100vh;margin:0;padding:0;background:#050914;">{html}</html>'

    # Polyfill script for SVG context DOM methods
    poly_script = """<script type="text/javascript"><![CDATA[
(function() {
  function getHead() {
    return document.getElementsByTagName("head")[0] || document.querySelector("head") || document.documentElement;
  }
  function getBody() {
    return document.getElementsByTagName("body")[0] || document.querySelector("body") || document.documentElement;
  }
  try {
    if (!document.head) {
      Object.defineProperty(document, "head", { get: getHead, configurable: true, enumerable: true });
    }
  } catch(e) { try { document.head = getHead(); } catch(e2){} }
  try {
    if (!document.body) {
      Object.defineProperty(document, "body", { get: getBody, configurable: true, enumerable: true });
    }
  } catch(e) { try { document.body = getBody(); } catch(e2){} }
})();
]]></script>"""

    # Assemble complete SVG
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" style="width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; margin: 0; padding: 0; background: #050914;">
  {poly_script}
  <foreignObject x="0" y="0" width="100%" height="100%" style="width: 100%; height: 100%; border: none; margin: 0; padding: 0;">
{html}
  </foreignObject>
</svg>"""

    print("7. Validating XML format...")
    try:
        ET.fromstring(svg_content)
        print("SUCCESS! Valid XML SVG generated.")
    except ET.ParseError as e:
        print("XML Parse Error:", e)
        return False

    targets = [
        "public/index.svg",
        "index.svg",
        "public/singlefile/index.svg",
        "singlefile/index.svg"
    ]
    for target in targets:
        os.makedirs(os.path.dirname(target) if os.path.dirname(target) else ".", exist_ok=True)
        with open(target, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"Wrote {target} ({len(svg_content)} bytes)")

    return True

if __name__ == "__main__":
    build_svg()
