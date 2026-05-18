#!/usr/bin/env node
/**
 * 目錄索引產生器
 * 掃描 lectures/ 子目錄，讀取每門課程的 config.yaml，產生根目錄 index.html
 *
 * Usage: node build-index.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LECTURES_DIR = resolve(__dirname, 'lectures');
const OUT_FILE = resolve(__dirname, 'index.html');

// ─── Detect GitHub Pages base URL ───

function detectGitHubPagesBase() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { cwd: __dirname, encoding: 'utf-8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
    if (match) {
      const [, owner, repo] = match;
      return `https://${owner}.github.io/${repo}`;
    }
  } catch { /* not a git repo or no remote */ }
  return '';
}

// ─── Minimal YAML parser (reused from build.mjs) ───

function unquote(s) {
  if (!s) return '';
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s === 'true') return true;
  if (s === 'false') return false;
  return s;
}

function findNextNonEmpty(lines, start, end) {
  for (let i = start; i < end; i++) {
    if (lines[i].trim() !== '' && !/^\s*#/.test(lines[i])) return i;
  }
  return end;
}

function skipBlock(lines, start, end, parentIndent) {
  let i = start;
  while (i < end) {
    const l = lines[i];
    if (l.trim() === '' || /^\s*#/.test(l)) { i++; continue; }
    if (l.search(/\S/) <= parentIndent) break;
    i++;
  }
  return i;
}

function parseYamlArray(lines, start, end, parentIndent) {
  const arr = [];
  let i = start;
  while (i < end) {
    const l = lines[i];
    if (l.trim() === '' || /^\s*#/.test(l)) { i++; continue; }
    const ind = l.search(/\S/);
    if (ind <= parentIndent) break;
    if (l.trim().startsWith('- ')) {
      const val = l.trim().slice(2).trim();
      if (val) {
        if (val.includes(': ')) {
          const obj = {};
          const kv = val.match(/^(\w+):\s*(.*)/);
          if (kv) { obj[kv[1]] = unquote(kv[2]); }
          const ni = findNextNonEmpty(lines, i + 1, end);
          if (ni < end && lines[ni].search(/\S/) > ind) {
            const sub = parseYamlBlock(lines, i + 1, end, ind);
            arr.push({ ...obj, ...sub });
            i = skipBlock(lines, i + 1, end, ind);
            continue;
          }
          arr.push(obj);
        } else {
          arr.push(unquote(val));
        }
      } else {
        const ni = findNextNonEmpty(lines, i + 1, end);
        if (ni < end && lines[ni].search(/\S/) > ind) {
          arr.push(parseYamlBlock(lines, i + 1, end, ind));
          i = skipBlock(lines, i + 1, end, ind);
          continue;
        } else {
          arr.push('');
        }
      }
    }
    i++;
  }
  return arr;
}

function parseYamlBlock(lines, start, end, parentIndent) {
  const result = {};
  let i = start;
  while (i < end) {
    const line = lines[i];
    if (line.trim() === '' || /^\s*#/.test(line)) { i++; continue; }
    const indent = line.search(/\S/);
    if (indent <= parentIndent) break;
    if (line.trim().startsWith('- ')) { i++; continue; }
    const kvMatch = line.trim().match(/^([\w]+):\s*(.*)/);
    if (!kvMatch) { i++; continue; }
    const key = kvMatch[1];
    let val = kvMatch[2].trim();
    if (val === '>') {
      let mlVal = '';
      i++;
      while (i < end) {
        const nl = lines[i];
        if (nl.trim() === '' || /^\s*#/.test(nl)) { i++; continue; }
        const ni = nl.search(/\S/);
        if (ni <= indent) break;
        mlVal += (mlVal ? ' ' : '') + nl.trim();
        i++;
      }
      result[key] = mlVal;
      continue;
    }
    const nextNonEmpty = findNextNonEmpty(lines, i + 1, end);
    if (nextNonEmpty < end && lines[nextNonEmpty].trim().startsWith('- ')) {
      const nextIndent = lines[nextNonEmpty].search(/\S/);
      if (nextIndent > indent) {
        result[key] = parseYamlArray(lines, i + 1, end, indent);
        i = skipBlock(lines, i + 1, end, indent);
        continue;
      }
    }
    if (val === '') {
      const ni = findNextNonEmpty(lines, i + 1, end);
      if (ni < end && lines[ni].search(/\S/) > indent) {
        result[key] = parseYamlBlock(lines, i + 1, end, indent);
        i = skipBlock(lines, i + 1, end, indent);
        continue;
      }
      result[key] = '';
      i++;
      continue;
    }
    result[key] = unquote(val);
    i++;
  }
  return result;
}

function parseYamlFull(text) {
  const cleanLines = text.split('\n').map(l => l.replace(/\s+$/, ''));
  return parseYamlBlock(cleanLines, 0, cleanLines.length, -1);
}

// ─── Scan lectures/ ───

function scanLectures(base) {
  const base64Cache = new Map();

  function toBase64(imgPath) {
    if (!existsSync(imgPath)) return null;
    if (base64Cache.has(imgPath)) return base64Cache.get(imgPath);
    const buf = readFileSync(imgPath);
    const ext = imgPath.split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const uri = `data:${mime};base64,${buf.toString('base64')}`;
    base64Cache.set(imgPath, uri);
    return uri;
  }

  const entries = readdirSync(base, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const lectures = [];
  for (const name of entries) {
    const dir = join(base, name);
    const configPath = join(dir, 'config.yaml');
    const indexPath = join(dir, 'index.html');
    if (!existsSync(configPath)) continue; // skip dirs without config

    const raw = readFileSync(configPath, 'utf-8');
    const cfg = parseYamlFull(raw);

    const title = cfg.page?.title || cfg.seo?.title || name;
    const badge = cfg.page?.badge || '';
    const subtitle = cfg.seo?.description || cfg.page?.subtitle || '';
    const ogUrl = cfg.seo?.image || '';

    // Try local og-image
    const localOg = join(dir, 'assets', 'og-image.jpg');
    const localOgPng = join(dir, 'assets', 'og-image.png');
    let ogSrc = null;
    if (existsSync(localOg)) ogSrc = toBase64(localOg);
    else if (existsSync(localOgPng)) ogSrc = toBase64(localOgPng);
    else if (ogUrl) ogSrc = ogUrl; // fallback to remote URL

    // Determine href
    const hasIndex = existsSync(indexPath);
    const href = hasIndex ? `lectures/${name}/` : null;

    lectures.push({ name, title, badge, subtitle, ogSrc, href });
  }
  return lectures;
}

// ─── Build HTML ───

function buildIndexHtml(lectures, baseUrl) {
  const siteTitle = '澳門科學館 · 課程目錄';
  const siteDesc = '澳門科學館 AI 課程系列，探索生成式 AI 的實務應用與資安防護。';
  const ogImage = lectures[0]?.ogSrc?.startsWith('http') ? lectures[0].ogSrc : '';
  const canonicalUrl = baseUrl ? `${baseUrl}/` : '';
  const faviconUrl = 'https://lh3.googleusercontent.com/a/ACg8ocKqgHiVygLR36jXlNIMBwJ3L13eCHNm0KEMCwKtcjNAj6BEzgQx=s576-c-no';

  const cards = lectures.map(l => {
    const imgTag = l.ogSrc
      ? `<div class="course-img"><img src="${l.ogSrc}" alt="${l.title}" loading="lazy"></div>`
      : `<div class="course-img course-img--placeholder"><span>${l.title.charAt(0)}</span></div>`;

    const badgeHtml = l.badge ? `<p class="course-badge">${l.badge}</p>` : '';
    const descHtml = l.subtitle ? `<p class="course-desc">${l.subtitle}</p>` : '';

    const inner = `
      ${imgTag}
      <div class="course-body">
        ${badgeHtml}
        <h2 class="course-title">${l.title}</h2>
        ${descHtml}
        <span class="course-cta">立即學習 →</span>
      </div>`;

    if (l.href) {
      return `<a href="${l.href}" class="course-card">${inner}</a>`;
    } else {
      return `<div class="course-card course-card--no-link">${inner}</div>`;
    }
  }).join('\n');

  const emptyMsg = lectures.length === 0
    ? `<p class="empty">尚無課程，請將課程資料夾放入 <code>lectures/</code> 目錄。</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${siteTitle}</title>
  <link rel="icon" type="image/png" href="${faviconUrl}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${siteTitle}">
  <meta property="og:description" content="${siteDesc}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}">` : ''}
  <meta property="og:site_name" content="澳門科學館">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0f1117;
      --bg-card: #181b25;
      --bg-card-alt: #1e2130;
      --text: #e4e4e7;
      --text-dim: #8b8d9a;
      --accent: #e8845a;
      --accent-rgb: 232 132 90;
      --accent2: #e8b878;
      --accent2-rgb: 232 184 120;
      --border: #2a2d3a;
      --radius: 12px;
    }
    [data-theme="light"] {
      --bg: #f5f5f7;
      --bg-card: #ffffff;
      --bg-card-alt: #f0f0f3;
      --text: #1a1a2e;
      --text-dim: #5a5b6a;
      --accent: #c45c28;
      --accent-rgb: 196 92 40;
      --accent2: #9a7028;
      --accent2-rgb: 154 112 40;
      --border: #d4d4d8;
    }
    html { scroll-behavior: smooth; font-size: 16px; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Noto Sans TC', sans-serif;
      line-height: 1.8;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* ── Header ── */
    .site-header {
      border-bottom: 1px solid var(--border);
      padding: 1.25rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      position: sticky;
      top: 0;
      background: rgb(15 17 23 / .92);
      backdrop-filter: blur(12px);
      z-index: 100;
    }
    [data-theme="light"] .site-header {
      background: rgb(245 245 247 / .92);
    }
    .site-logo {
      display: flex;
      align-items: center;
      gap: .75rem;
      text-decoration: none;
      color: var(--text);
    }
    .site-logo img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
    .site-logo-name {
      font-family: 'Noto Serif TC', serif;
      font-weight: 700;
      font-size: 1rem;
    }
    .theme-btn {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-dim);
      border-radius: 8px;
      padding: .4rem .75rem;
      cursor: pointer;
      font-size: .85rem;
      transition: border-color .2s, color .2s;
    }
    .theme-btn:hover { border-color: var(--accent); color: var(--accent); }

    /* ── Hero ── */
    .hero {
      text-align: center;
      padding: 5rem 2rem 3rem;
      position: relative;
      overflow: clip;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -20%;
      left: -10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgb(var(--accent-rgb) / .1) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -20%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgb(var(--accent2-rgb) / .07) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: .5rem;
      padding: .35rem .9rem;
      border: 1px solid var(--border);
      border-radius: 100px;
      font-size: .78rem;
      color: var(--text-dim);
      letter-spacing: .06em;
      margin-bottom: 1.5rem;
    }
    .hero-badge .dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
    .hero h1 {
      font-family: 'Noto Serif TC', serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      line-height: 1.3;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--text) 30%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      padding: 0.08em 0.2em 0.16em;
    }
    .hero-sub {
      font-size: clamp(.95rem, 2vw, 1.1rem);
      color: var(--text-dim);
      max-width: 560px;
      margin: 0 auto 1rem;
      font-weight: 300;
    }
    .hero-count {
      font-size: .85rem;
      color: var(--accent);
      font-weight: 500;
    }

    /* ── Grid ── */
    .grid-wrap {
      max-width: min(1080px, 92%);
      margin: 0 auto;
      padding: 2rem 0 6rem;
    }
    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .empty {
      color: var(--text-dim);
      text-align: center;
      padding: 4rem 0;
      font-size: .95rem;
    }

    /* ── Course Card ── */
    .course-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: var(--text);
      transition: border-color .3s, transform .3s, box-shadow .3s;
    }
    .course-card:hover {
      border-color: rgb(var(--accent-rgb) / .45);
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgb(0 0 0 / .25);
    }
    .course-card--no-link {
      opacity: .6;
      cursor: default;
    }
    .course-img {
      width: 100%;
      aspect-ratio: 1200 / 630;
      overflow: hidden;
      background: var(--bg-card-alt);
    }
    .course-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform .4s ease;
    }
    .course-card:hover .course-img img {
      transform: scale(1.03);
    }
    .course-img--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .course-img--placeholder span {
      font-family: 'Noto Serif TC', serif;
      font-size: 3rem;
      font-weight: 900;
      color: rgb(var(--accent-rgb) / .3);
    }
    .course-body {
      padding: 1.4rem 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .course-badge {
      font-size: .72rem;
      color: var(--accent);
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: .6rem;
      font-weight: 500;
    }
    .course-title {
      font-family: 'Noto Serif TC', serif;
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.45;
      margin-bottom: .65rem;
    }
    .course-desc {
      font-size: .88rem;
      color: var(--text-dim);
      line-height: 1.65;
      flex: 1;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .course-cta {
      font-size: .82rem;
      color: var(--accent2);
      font-weight: 500;
      transition: color .2s;
    }
    .course-card:hover .course-cta { color: var(--accent); }

    /* ── Footer ── */
    .site-footer {
      border-top: 1px solid var(--border);
      text-align: center;
      padding: 2rem;
      font-size: .82rem;
      color: var(--text-dim);
    }
  </style>
</head>
<body>

<header class="site-header">
  <a href="./" class="site-logo">
    <img src="${faviconUrl}" alt="澳門科學館">
    <span class="site-logo-name">澳門科學館</span>
  </a>
  <button class="theme-btn" onclick="toggleTheme()" aria-label="切換主題">☀ / ☾</button>
</header>

<section class="hero">
  <div class="hero-badge"><span class="dot"></span>AI 課程系列</div>
  <h1>課程目錄</h1>
  <p class="hero-sub">探索生成式 AI 的實務應用與資安防護，與澳門科學館一同踏入 AI 新時代。</p>
  <p class="hero-count">${lectures.length} 門課程</p>
</section>

<div class="grid-wrap">
  ${emptyMsg}
  <div class="course-grid">
    ${cards}
  </div>
</div>

<footer class="site-footer">
  <p>© 澳門科學館</p>
</footer>

<script>
  (function () {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
  })();

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  }
</script>
</body>
</html>`;
}

// ─── Main ───

const baseUrl = detectGitHubPagesBase();
const lectures = scanLectures(LECTURES_DIR);

console.log(`掃描到 ${lectures.length} 門課程：`);
for (const l of lectures) {
  console.log(`  • ${l.name}  →  ${l.title}  ${l.href ? '✓' : '（無 index.html）'}`);
}

const html = buildIndexHtml(lectures, baseUrl);
writeFileSync(OUT_FILE, html, 'utf-8');
console.log(`\n✓ 已產生：index.html`);
