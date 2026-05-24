#!/usr/bin/env node
/**
 * 課程清單產生器
 * 掃描 lectures/ 子目錄，讀取每門課程的 config.yaml，產生 lectures/manifest.js
 *
 * Usage: node .agents/skills/course-page-generator/scripts/build-index.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../../../');
const LECTURES_DIR = resolve(REPO_ROOT, 'lectures');
const OUT_FILE = resolve(REPO_ROOT, 'lectures', 'manifest.js');

// ─── Minimal YAML parser ───

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
  const entries = readdirSync(base, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const lectures = [];
  for (const name of entries) {
    const dir = join(base, name);
    const configPath = join(dir, 'config.yaml');
    const indexPath = join(dir, 'index.html');
    if (!existsSync(configPath)) continue;

    const raw = readFileSync(configPath, 'utf-8');
    const cfg = parseYamlFull(raw);

    const title = cfg.page?.title || cfg.seo?.title || name;
    const badge = cfg.page?.badge || '';
    const subtitle = cfg.seo?.description || cfg.page?.subtitle || '';
    const category = cfg.page?.category || '';
    const published = cfg.page?.published !== false; // default true

    // Skip unpublished courses
    if (!published) continue;

    // Prefer local og-image (relative path), fallback to seo.image URL
    const localOgJpg = join(dir, 'assets', 'og-image.jpg');
    const localOgPng = join(dir, 'assets', 'og-image.png');
    let ogImage = null;
    if (existsSync(localOgJpg)) ogImage = `lectures/${name}/assets/og-image.jpg`;
    else if (existsSync(localOgPng)) ogImage = `lectures/${name}/assets/og-image.png`;
    else if (cfg.seo?.image) ogImage = cfg.seo.image;

    const href = existsSync(indexPath) ? `lectures/${name}/` : null;

    const entry = { title, badge, subtitle, ogImage, href };
    if (category) entry.category = category;
    lectures.push(entry);
  }
  return lectures;
}

// ─── Main ───

const lectures = scanLectures(LECTURES_DIR);

console.log(`掃描到 ${lectures.length} 門課程：`);
for (const l of lectures) {
  const status = l.href ? '✓' : '（無 index.html）';
  const cat = l.category ? ` [${l.category}]` : '';
  console.log(`  • ${l.title}${cat}  ${status}`);
}

writeFileSync(OUT_FILE, `window.__courses__ = ${JSON.stringify(lectures, null, 2)};\n`, 'utf-8');
console.log(`\n✓ 已產生：lectures/manifest.js`);
