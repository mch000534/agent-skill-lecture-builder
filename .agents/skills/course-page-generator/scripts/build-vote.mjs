#!/usr/bin/env node
// 將 config/global.yaml 的 vote.gas_url 注入 vote/index.html。
// 用法：node .agents/skills/course-page-generator/scripts/build-vote.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../../');

function findGlobalConfig() {
  let dir = repoRoot;
  for (let i = 0; i < 5; i++) {
    const p = resolve(dir, 'config/global.yaml');
    if (existsSync(p)) return p;
    dir = resolve(dir, '..');
  }
  return null;
}

function parseGasUrl(yamlText) {
  const m = yamlText.match(/gas_url\s*:\s*["']([^"']*)["']/);
  if (m) return m[1].trim();
  const m2 = yamlText.match(/gas_url\s*:\s*([^\n#"'][^\n#]*)/);
  return m2 ? m2[1].trim() : '';
}

const configPath = findGlobalConfig();
if (!configPath) {
  console.error('找不到 config/global.yaml');
  process.exit(1);
}

const yamlText = readFileSync(configPath, 'utf8');
const gasUrl = parseGasUrl(yamlText);

const votePath = resolve(repoRoot, 'vote/index.html');
if (!existsSync(votePath)) {
  console.error('找不到 vote/index.html');
  process.exit(1);
}

let html = readFileSync(votePath, 'utf8');
const before = html;

html = html.replace(
  /var GAS_ENDPOINT\s*=\s*['"][^'"]*['"][^\S\r\n]*;?[^\S\r\n]*/,
  `var GAS_ENDPOINT = '${gasUrl}';\n    `
);

if (html === before) {
  console.log('vote/index.html: GAS_ENDPOINT 未變更（找不到替換目標）');
} else {
  writeFileSync(votePath, html, 'utf8');
  console.log(gasUrl
    ? `vote/index.html: GAS_ENDPOINT 已設定`
    : `vote/index.html: GAS_ENDPOINT 已清空（config 未填 gas_url）`
  );
}
