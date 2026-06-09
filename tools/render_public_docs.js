#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = process.argv[2] || 'docs/aig';
const root = path.resolve(ROOT);

marked.setOptions({
  gfm: true,
  breaks: false,
  mangle: false,
  headerIds: true,
});

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function titleFromMarkdown(md, filename) {
  const lines = md.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const firstHash = lines.find(l => /^#\s+/.test(l));
  if (firstHash) return firstHash.replace(/^#\s+/, '').trim();
  const first = lines.find(l => !/^=+$/.test(l) && !/^-+$/.test(l));
  return first || filename.replace(/\.md$/i, '').replace(/_/g, ' ');
}

function template({ title, sourceName, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="color-scheme" content="dark light">
  <title>${esc(title)} | Akamai Intelligence Group</title>
  <style>
    :root {
      --bg: #07080b;
      --panel: #10131a;
      --panel2: #151a23;
      --text: #eef3ff;
      --muted: #a7b0c0;
      --line: rgba(255,255,255,.12);
      --accent: #00d4ff;
      --accent2: #8a5cff;
      --code: #0b0f16;
      --max: 980px;
    }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
    body {
      margin: 0;
      background: radial-gradient(circle at 20% 0%, rgba(0,212,255,.14), transparent 28rem), radial-gradient(circle at 80% 10%, rgba(138,92,255,.13), transparent 26rem), var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.68;
      overflow-wrap: anywhere;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      backdrop-filter: blur(16px);
      background: rgba(7,8,11,.78);
      border-bottom: 1px solid var(--line);
    }
    .topbar-inner {
      max-width: var(--max);
      margin: 0 auto;
      padding: .8rem clamp(1rem, 3vw, 2rem);
      display: flex;
      gap: .75rem;
      align-items: center;
      justify-content: space-between;
    }
    .brand { font-weight: 800; letter-spacing: .08em; font-size: .78rem; color: var(--muted); text-transform: uppercase; }
    .nav { display: flex; gap: .65rem; flex-wrap: wrap; justify-content: flex-end; }
    .nav a {
      border: 1px solid var(--line);
      background: rgba(255,255,255,.04);
      color: var(--text);
      padding: .42rem .65rem;
      border-radius: 999px;
      font-size: .82rem;
      white-space: nowrap;
    }
    main {
      max-width: var(--max);
      margin: 0 auto;
      padding: clamp(1.1rem, 3.2vw, 2.5rem);
    }
    article {
      background: linear-gradient(180deg, rgba(21,26,35,.92), rgba(16,19,26,.92));
      border: 1px solid var(--line);
      border-radius: 24px;
      padding: clamp(1.1rem, 4vw, 2.5rem);
      box-shadow: 0 24px 80px rgba(0,0,0,.36);
    }
    .doc-meta {
      color: var(--muted);
      font-size: .88rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--line);
    }
    h1, h2, h3, h4 { line-height: 1.18; letter-spacing: -.02em; scroll-margin-top: 5rem; }
    h1 { font-size: clamp(1.65rem, 6vw, 3.2rem); margin: .1rem 0 1rem; }
    h2 { font-size: clamp(1.25rem, 4vw, 2rem); margin-top: 2.3rem; padding-top: .6rem; border-top: 1px solid var(--line); }
    h3 { font-size: clamp(1.08rem, 3vw, 1.45rem); margin-top: 1.8rem; color: #dfe8ff; }
    p, li { font-size: clamp(1rem, 2.7vw, 1.08rem); }
    p { margin: 1rem 0; }
    ul, ol { padding-left: 1.35rem; }
    li { margin: .45rem 0; }
    blockquote {
      border-left: 4px solid var(--accent);
      margin: 1.2rem 0;
      padding: .5rem 1rem;
      background: rgba(0,212,255,.07);
      color: #dceeff;
      border-radius: 0 14px 14px 0;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
      background: rgba(0,0,0,.32);
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 7px;
      padding: .13rem .35rem;
      font-size: .92em;
      overflow-wrap: anywhere;
    }
    pre {
      background: var(--code);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 1rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      white-space: pre;
      max-width: 100%;
    }
    pre code { background: transparent; border: 0; padding: 0; white-space: pre; overflow-wrap: normal; }
    table {
      width: 100%;
      border-collapse: collapse;
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 1.2rem 0;
      border: 1px solid var(--line);
      border-radius: 14px;
    }
    th, td { padding: .72rem .85rem; border-bottom: 1px solid var(--line); vertical-align: top; min-width: 9rem; }
    th { background: rgba(0,212,255,.1); text-align: left; }
    hr { border: 0; border-top: 1px solid var(--line); margin: 2rem 0; }
    .footer-note { color: var(--muted); font-size: .85rem; margin-top: 1.25rem; text-align: center; }
    @media (max-width: 640px) {
      .topbar-inner { align-items: flex-start; flex-direction: column; }
      .nav { justify-content: flex-start; }
      article { border-radius: 18px; }
      th, td { min-width: 12rem; }
    }
    @media print {
      body { background: #fff; color: #111; }
      .topbar { display: none; }
      article { box-shadow: none; border: 0; }
      a { color: #0645ad; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">Akamai Intelligence Group</div>
      <nav class="nav">
        <a href="../index.html">Home</a>
        <a href="../research.html">Research</a>
        <a href="../dice.html">DICE</a>
      </nav>
    </div>
  </header>
  <main>
    <article>
      <div class="doc-meta">Public research document. Responsive HTML edition generated from <code>${esc(sourceName)}</code>.</div>
${body}
    </article>
    <div class="footer-note">AIG public documentation / mobile-readable edition</div>
  </main>
</body>
</html>`;
}

const files = fs.readdirSync(root).filter(f => f.endsWith('.md')).sort();
for (const file of files) {
  const input = path.join(root, file);
  const md = fs.readFileSync(input, 'utf8').replace(/^\uFEFF/, '');
  const body = marked.parse(md);
  const title = titleFromMarkdown(md, file);
  const output = path.join(root, file.replace(/\.md$/i, '.html'));
  fs.writeFileSync(output, template({ title, sourceName: file, body }), 'utf8');
  console.log(`${file} -> ${path.basename(output)}`);
}
