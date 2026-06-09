#!/usr/bin/env node
/**
 * Validate content.md and config.yaml before build.
 *
 * Checks:
 *   1. Unclosed block tags in content.md
 *   2. # sections using half-width colon instead of full-width ：
 *   3. Unclosed ```prompt / ```terminal blocks
 *   4. seo.url / seo.image in config.yaml (absolute URL + contains lectures/)
 *   5. [image-here] placeholder not replaced (warning)
 *   6. ![...](path) with empty alt (warning — becomes empty figcaption)
 *   7. Chapter hero count > 4 (warning — recommend 2–4 per course)
 *   8. Generic alt text like "image" / "img" / "picture" (warning)
 *
 * Usage: node validate.mjs <course-dir>
 * Exit:  0 = pass (warnings allowed), 1 = errors found
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

// Paired block tags that must be explicitly closed
const BLOCK_TAGS = [
  { open: /^\[flow\]$/,             close: /^\[\/flow\]$/,          name: '[flow]' },
  { open: /^\[tags\]$/,             close: /^\[\/tags\]$/,          name: '[tags]' },
  { open: /^\[summary\]$/,          close: /^\[\/summary\]$/,       name: '[summary]' },
  { open: /^\[bonus\b/,             close: /^\[\/bonus\]$/,         name: '[bonus]' },
  { open: /^\[compare(\s|\])/,      close: /^\[\/compare\]$/,       name: '[compare]' },
  { open: /^\[compare-table\b/,     close: /^\[\/compare-table\]$/, name: '[compare-table]' },
  { open: /^\[vote\b/,              close: /^\[\/vote\]$/,          name: '[vote]' },
  { open: /^\[quiz\b/,              close: /^\[\/quiz\]$/,          name: '[quiz]' },
  { open: /^\[image-text\b/,        close: /^\[\/image-text\]$/,    name: '[image-text]' },
  { open: /^\[tabs\]$/,             close: /^\[\/tabs\]$/,          name: '[tabs]' },
  { open: /^\[callout\b/,           close: /^\[\/callout\]$/,       name: '[callout]' },
  { open: /^\[accordion\]$/,        close: /^\[\/accordion\]$/,     name: '[accordion]' },
  { open: /^\[reveal\b/,            close: /^\[\/reveal\]$/,        name: '[reveal]' },
  { open: /^\[timeline\]$/,         close: /^\[\/timeline\]$/,      name: '[timeline]' },
  { open: /^\[steps-status\]$/,     close: /^\[\/steps-status\]$/,  name: '[steps-status]' },
  { open: /^\[stats\]$/,            close: /^\[\/stats\]$/,         name: '[stats]' },
  { open: /^\[dl\]$/,               close: /^\[\/dl\]$/,            name: '[dl]' },
];

function validateContent(contentPath) {
  const errors = [];
  const warnings = [];

  if (!existsSync(contentPath)) {
    errors.push(`找不到 content.md：${contentPath}`);
    return { errors, warnings };
  }

  const lines = readFileSync(contentPath, 'utf-8').split('\n');

  // Check 1: unclosed block tags
  for (const tag of BLOCK_TAGS) {
    const stack = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (tag.open.test(t)) {
        stack.push(i + 1);
      } else if (tag.close.test(t)) {
        if (stack.length === 0) {
          errors.push(`第 ${i + 1} 行：${tag.name} 多餘的關閉標籤（找不到對應的開啟標籤）`);
        } else {
          stack.pop();
        }
      }
    }
    for (const lineNo of stack) {
      errors.push(`第 ${lineNo} 行：${tag.name} 未閉合（缺少對應的結束標籤）`);
    }
  }

  // Check 2: [youtube] block form (single-line needs no closing tag)
  {
    const stack = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (/^\[youtube\b/.test(t)) {
        const isSingleLine = /^\[youtube\b[^\]]*\]\s*$/.test(t);
        if (!isSingleLine) stack.push(i + 1);
      } else if (/^\[\/youtube\]$/.test(t)) {
        if (stack.length === 0) {
          errors.push(`第 ${i + 1} 行：[youtube] 多餘的關閉標籤`);
        } else {
          stack.pop();
        }
      }
    }
    for (const lineNo of stack) {
      errors.push(`第 ${lineNo} 行：[youtube]（多行形式）未閉合（缺少 [/youtube]）`);
    }
  }

  // Check 3: unclosed ```prompt / ```terminal blocks
  {
    let openLine = null;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (openLine === null && /^```(prompt|terminal)/i.test(t)) {
        openLine = i + 1;
      } else if (openLine !== null && t === '```') {
        openLine = null;
      }
    }
    if (openLine !== null) {
      errors.push(`第 ${openLine} 行：\`\`\`prompt / \`\`\`terminal 區塊未閉合（缺少結尾的 \`\`\`）`);
    }
  }

  // Check 4: # sections — warn if half-width colon instead of full-width ：
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^# /.test(line)) {
      const title = line.replace(/^# /, '').trim();
      if (/:/.test(title) && !/：/.test(title)) {
        warnings.push(`第 ${i + 1} 行：章節標題使用半形冒號 ":"，建議改為全形 "："（目前：${title}）`);
      }
    }
  }

  // Check 5: [image-here] placeholders not replaced
  for (let i = 0; i < lines.length; i++) {
    if (/\[image-here\]/.test(lines[i])) {
      warnings.push(`第 ${i + 1} 行：殘留 [image-here] 佔位符，建議執行 image-generator Skill 或替換為 ![](path)`);
    }
  }

  // Fenced code helper: track nested ``` / ```` fences.
  // Opening: ``` followed by non-empty content (```js, ```markdown [label=...], ````markdown).
  // Closing: exactly ``` (or ````) with nothing else on the line; pops one stack layer.
  const isOpenFence = (t) => /^`{3,}.+/.test(t); // ``` + content
  const isCloseFence = (t) => /^`{3,}\s*$/.test(t); // ``` alone
  const makeFenceWalker = () => {
    const stack = [];
    return (line) => {
      const t = line.trim();
      if (stack.length === 0) {
        if (isOpenFence(t)) { stack.push(t); return 'enter'; }
        return 'outside';
      }
      // Inside: only an exact ``` (or ````) close line pops; anything else is content
      if (isCloseFence(t)) { stack.pop(); return stack.length === 0 ? 'exit' : 'inside'; }
      return 'inside';
    };
  };

  // Check 6: ![...](path) with empty alt
  {
    const walk = makeFenceWalker();
    for (let i = 0; i < lines.length; i++) {
      const state = walk(lines[i]);
      if (state !== 'outside') continue;
      const matches = [...lines[i].matchAll(/!\[([^\]]*)\]\([^)]+\)/g)];
      for (const m of matches) {
        const alt = m[1].trim();
        if (!alt) {
          warnings.push(`第 ${i + 1} 行：圖片 alt 為空（![](...)），會產生空白 figcaption，請加上描述性文字`);
        } else if (/^(image|img|picture|圖片|照片|截圖|untitled|screenshot)$/i.test(alt)) {
          warnings.push(`第 ${i + 1} 行：圖片 alt "${alt}" 過於泛用，建議改為描述圖片內容的具體文字`);
        }
      }
    }
  }

  // Check 7: Chapter hero count (a hero = # heading followed by a standalone image, skipping > lead)
  {
    const heroLines = [];
    const walk = makeFenceWalker();
    for (let i = 0; i < lines.length; i++) {
      const state = walk(lines[i]);
      if (state !== 'outside') continue;
      if (!/^# /.test(lines[i])) continue;
      // Scan forward up to 8 lines: skip blank + > lead, stop at first fenced block boundary
      let crossedFence = false;
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const t = lines[j].trim();
        if (isOpenFence(t) || isCloseFence(t)) { crossedFence = true; break; }
        if (!t) continue;
        if (/^>/.test(t)) continue;
        if (/^!\[[^\]]+\]\([^)]+\)\s*$/.test(t)) {
          heroLines.push({ line: i + 1, title: lines[i].replace(/^# /, '').trim() });
        }
        break;
      }
      if (crossedFence) { /* heading has no hero within 8 lines */ }
    }
    if (heroLines.length > 4) {
      const list = heroLines.map(h => `L${h.line}「${h.title}」`).join('、');
      warnings.push(`Chapter hero 共 ${heroLines.length} 張（超過建議 2–4 張）：${list}。建議僅保留最具視覺錨點的章節`);
    }
  }

  return { errors, warnings };
}

function validateConfig(configPath) {
  const errors = [];
  const warnings = [];

  if (!existsSync(configPath)) return { errors, warnings };

  const lines = readFileSync(configPath, 'utf-8').split('\n');
  let inSeo = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (/^seo:/.test(trimmed)) { inSeo = true; continue; }
    if (inSeo && /^[a-z_]+:\s/.test(trimmed) && !/^\s/.test(line)) { inSeo = false; }

    if (!inSeo) continue;

    const checkField = (fieldMatch, fieldName) => {
      if (!fieldMatch) return;
      const val = fieldMatch[1].replace(/^["']|["']$/g, '').trim();
      if (!val || val.startsWith('https://your-domain')) return; // skip placeholder
      if (!/^https?:\/\//.test(val)) {
        errors.push(`config.yaml seo.${fieldName} 必須是絕對 URL（以 https:// 開頭）：${val}`);
      } else if (!val.includes('lectures/')) {
        warnings.push(`config.yaml seo.${fieldName} 路徑建議包含 "lectures/"：${val}`);
      }
    };

    checkField(trimmed.match(/^url:\s*(.+)$/), 'url');
    checkField(trimmed.match(/^image:\s*(.+)$/), 'image');
  }

  return { errors, warnings };
}

// ─── CLI ───

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node validate.mjs <course-dir>');
  process.exit(1);
}

const courseDir = resolve(args[0]);
const contentPath = join(courseDir, 'content.md');
const configPath = join(courseDir, 'config.yaml');

console.log(`\nValidating: ${courseDir}`);

const { errors: ce, warnings: cw } = validateContent(contentPath);
const { errors: fe, warnings: fw } = validateConfig(configPath);

const allErrors = [...ce, ...fe];
const allWarnings = [...cw, ...fw];

if (allWarnings.length) {
  console.log('\n警告：');
  for (const w of allWarnings) console.log(`  ⚠️  ${w}`);
}

if (allErrors.length) {
  console.log('\n錯誤：');
  for (const e of allErrors) console.log(`  ✗  ${e}`);
  console.log(`\n共 ${allErrors.length} 個錯誤，${allWarnings.length} 個警告`);
  process.exit(1);
} else {
  console.log(`\n✅ 驗證通過（${allWarnings.length} 個警告）`);
}
