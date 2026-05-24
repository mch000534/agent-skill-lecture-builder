#!/usr/bin/env node
/**
 * Scaffold a new lecture directory with config.yaml and content.md templates.
 *
 * Usage: node new-lecture.mjs <course-dir>
 *   e.g. node new-lecture.mjs lectures/my-course
 *   e.g. node new-lecture.mjs my-course          (creates ./my-course)
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

function detectGitHubPagesBase(cwd) {
  try {
    const remote = execSync('git remote get-url origin', { cwd, encoding: 'utf-8' }).trim();
    const m = remote.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
    if (m) return `https://${m[1]}.github.io/${m[2]}`;
  } catch { /* no remote */ }
  return null;
}

// ─── CLI ───

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node new-lecture.mjs <course-dir>');
  console.log('  e.g. node new-lecture.mjs lectures/my-course');
  process.exit(1);
}

const courseDir = resolve(args[0]);
const lectureName = basename(courseDir);

if (existsSync(courseDir)) {
  console.error(`✗  目錄已存在：${courseDir}`);
  process.exit(1);
}

const ghBase = detectGitHubPagesBase(process.cwd());
// Compute relative path from repo root to keep lectures/ in URL
const repoRoot = resolve(__dirname, '../../../..');
const relFromRoot = courseDir.startsWith(repoRoot)
  ? courseDir.slice(repoRoot.length + 1).replace(/\\/g, '/')
  : `lectures/${lectureName}`;

const seoUrl = ghBase
  ? `${ghBase}/${relFromRoot}/`
  : `https://your-domain.example/${relFromRoot}/`;
const seoImage = ghBase
  ? `${ghBase}/${relFromRoot}/assets/og-image.jpg`
  : `https://your-domain.example/${relFromRoot}/assets/og-image.jpg`;

// ─── Create directory structure ───

mkdirSync(join(courseDir, 'assets'), { recursive: true });

// ─── config.yaml ───

writeFileSync(join(courseDir, 'config.yaml'), `\
page:
  title: "課程標題 — 副標"
  badge: "課程分類 · 主題標籤"
  hero_title: "課程主標題<br>第二行"
  subtitle: "課程簡介，說明學習重點與適合對象。"

seo:
  title: "課程 SEO 標題｜主題摘要"
  description: "課程 SEO 描述，建議 120 字以內。"
  url: "${seoUrl}"
  image: "${seoImage}"
`, 'utf-8');

// ─── content.md ───

writeFileSync(join(courseDir, 'content.md'), `\
# 章節一：標題
> 章節引言，簡述本章重點。

## 子章節

### 卡片標題
- 重點一
- 重點二
- 重點三

# 章節二：標題
> 章節引言，簡述本章重點。

## 子章節

### 卡片標題
- 重點一
- 重點二
`, 'utf-8');

// ─── Done ───

console.log(`\n✅ 已建立課程目錄：${courseDir}`);
console.log(`   config.yaml — 請填寫標題、SEO 描述等欄位`);
console.log(`   content.md  — 請填入課程內容`);
console.log(`   assets/     — 放置圖片等素材`);
if (ghBase) {
  console.log(`\n   SEO URL（已自動填入）：${seoUrl}`);
}
console.log(`\n下一步：`);
console.log(`   node .agents/skills/course-page-generator/scripts/build.mjs ${args[0]}`);
