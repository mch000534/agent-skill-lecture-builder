#!/usr/bin/env node
/**
 * Validate content.md and config.yaml before build.
 *
 * Checks:
 *   1. Unclosed block tags in content.md
 *   2. # sections using half-width colon instead of full-width ：
 *   3. Unclosed ```prompt / ```terminal blocks
 *   4. seo.url / seo.image in config.yaml (absolute URL + contains lectures/)
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
