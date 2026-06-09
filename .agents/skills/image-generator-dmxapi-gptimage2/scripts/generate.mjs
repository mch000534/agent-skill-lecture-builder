#!/usr/bin/env node

/**
 * Generate an image via DMXAPI GPT Image 2.
 *
 * Usage:
 *   node generate.mjs --prompt "..." --output "path/to/image.png" [options]
 *
 * Options:
 *   --prompt   (required) Image generation prompt
 *   --output   (required) Output file path
 *   --model    Model name (default: gpt-image-2-ssvip)
 *   --size     Image size: auto|1024x1024|1536x1024|1024x1536|2048x2048|2048x1152|3840x2160|2160x3840 (default: auto)
 *   --quality  Generation quality: auto|high|medium|low (default: auto)
 *   --format   Output format: png|jpeg|webp (default: png)
 *
 * Environment:
 *   Reads DMXAPI_KEY from .env in the skill directory.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function loadEnv() {
  const envPath = resolve(SKILL_DIR, '.env');
  if (!existsSync(envPath)) {
    console.error(`[ERROR] .env not found at ${envPath}`);
    console.error('Please create .env with DMXAPI_KEY=your-api-key-here');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    env[key] = val;
  }
  return env;
}

async function generateImage({ prompt, model, size, quality, format, apiKey }) {
  const body = {
    model,
    prompt,
    n: 1,
    size,
    quality,
    output_format: format,
  };

  const res = await fetch('https://www.dmxapi.cn/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (!json.data || json.data.length === 0) {
    throw new Error('API returned empty data');
  }

  const item = json.data[0];

  if (item.b64_json) {
    return Buffer.from(item.b64_json, 'base64');
  }

  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) {
      throw new Error(`Failed to download image from URL: ${imgRes.status}`);
    }
    const arrayBuf = await imgRes.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

  throw new Error('API returned neither b64_json nor url');
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    console.log(`Usage: node generate.mjs --prompt "..." --output "path/to/image.png" [options]

Options:
  --prompt   (required) Image generation prompt
  --output   (required) Output file path
  --model    Model name (default: gpt-image-2-ssvip)
  --size     Image size (default: auto)
  --quality  Quality: auto|high|medium|low (default: auto)
  --format   Format: png|jpeg|webp (default: png)`);
    process.exit(0);
  }

  if (!args.prompt || args.prompt === true) {
    console.error('[ERROR] --prompt is required');
    process.exit(1);
  }

  if (!args.output || args.output === true) {
    console.error('[ERROR] --output is required');
    process.exit(1);
  }

  const model = args.model || 'gpt-image-2-ssvip';
  const size = args.size || 'auto';
  const quality = args.quality || 'auto';
  const format = args.format || 'png';
  const outputPath = resolve(args.output);

  const env = loadEnv();
  const apiKey = env.DMXAPI_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.error('[ERROR] DMXAPI_KEY not set in .env');
    console.error(`Please edit ${resolve(SKILL_DIR, '.env')} and set your API key`);
    process.exit(1);
  }

  console.log(`  Model:   ${model}`);
  console.log(`  Size:    ${size}`);
  console.log(`  Quality: ${quality}`);
  console.log(`  Format:  ${format}`);
  console.log(`  Output:  ${outputPath}`);
  console.log(`  Prompt:  ${args.prompt.slice(0, 120)}${args.prompt.length > 120 ? '...' : ''}`);
  console.log();

  try {
    console.log('  Calling API...');
    const buffer = await generateImage({
      prompt: args.prompt,
      model,
      size,
      quality,
      format,
      apiKey,
    });

    const outDir = dirname(outputPath);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    writeFileSync(outputPath, buffer);
    const kb = (buffer.length / 1024).toFixed(1);
    console.log(`  Saved: ${outputPath} (${kb} KB)`);
  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    process.exit(1);
  }
}

main();
