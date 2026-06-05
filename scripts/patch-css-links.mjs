#!/usr/bin/env node
// Post-export patcher for Nextra 3 + Next.js 14 static export.
//
// Why this exists
// ---------------
// Nextra 3 alpha + Next.js 14 with `output: 'export'` ships the
// compiled CSS files inside `out/_next/static/css/*.css`, but the
// prerendered HTML files in `out/` never include a
// `<link rel="stylesheet" href=".../.../foo.css">` tag. Next 14 drops
// those tags during static export; Nextra 3 alpha does not patch the
// export to restore them. The result: pages render unstyled.
//
// The two CSS files the build emits are exactly:
//   - the Tailwind/Reset stylesheet, used globally
//   - the CSS Module(s) extracted from the project's own .module.css
// This script finds them, builds the correct `/docs/_next/static/...`
// hrefs (matching `basePath` + `assetPrefix`), and injects the link
// tags into every HTML file in `out/` right before the first
// `<script ... defer="" nomodule=...>` (or right after `<title>` if
// no scripts are present).
//
// It is idempotent: if a `<link rel="stylesheet" href="/docs/_next/...">`
// already exists pointing at one of the CSS files, the script does not
// add a duplicate. If the script is re-run after a rebuild, the old
// links are removed first (we treat any `<link rel="stylesheet" ...>`
// whose href starts with `/docs/_next/static/css/` as ours).
//
// Usage:
//   node scripts/patch-css-links.mjs [out-dir]
// Default out-dir is `./out`.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outDir = process.argv[2] || join(repoRoot, 'out');
const cssDir = join(outDir, '_next', 'static', 'css');
const basePath = process.env.NEXTRA_BASE_PATH || '/docs';

async function* walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === '_next' || ent.name === 'node_modules') continue;
      yield* walkHtml(full);
    } else if (ent.isFile() && ent.name.endsWith('.html')) {
      yield full;
    }
  }
}

async function readCssFiles() {
  const entries = await readdir(cssDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.css'))
    .map((e) => e.name)
    .sort();
  if (files.length === 0) {
    throw new Error(
      `No CSS files found in ${cssDir}. Has the build run yet?`
    );
  }
  return files;
}

function buildLinkTags(cssFiles) {
  // Order matters: the global stylesheet (Tailwind reset + Nextra
  // layout classes) first, then the component modules. We sort the
  // file list alphabetically and emit a single block. Both files are
  // required for a complete paint.
  return cssFiles
    .map(
      (file) =>
        `<link rel="stylesheet" href="${basePath}/_next/static/css/${file}"/>`
    )
    .join('');
}

function removeOldLinks(html) {
  // Strip any <link rel="stylesheet" href="/<basePath>/_next/static/css/...">
  // tags we previously injected. We are surgical: only our href prefix.
  const re = new RegExp(
    `<link\\s+rel="stylesheet"\\s+href="${basePath.replace(
      '/',
      '\\/'
    )}\/_next\/static\/css\/[^"]+"\\s*\\/?>`,
    'g'
  );
  return html.replace(re, '');
}

function injectLinks(html, linkBlock) {
  // Prefer to inject right before the first <script ...> in <head>.
  // Fall back to right after </title>, then right after <head>, then
  // prepended to <body>.
  const beforeScript = /(<script\b)/.exec(html);
  if (beforeScript) {
    return (
      html.slice(0, beforeScript.index) +
      linkBlock +
      html.slice(beforeScript.index)
    );
  }
  const afterTitle = /<\/title>/.exec(html);
  if (afterTitle) {
    return (
      html.slice(0, afterTitle.index + afterTitle[0].length) +
      linkBlock +
      html.slice(afterTitle.index + afterTitle[0].length)
    );
  }
  const afterHead = /<head[^>]*>/.exec(html);
  if (afterHead) {
    return (
      html.slice(0, afterHead.index + afterHead[0].length) +
      linkBlock +
      html.slice(afterHead.index + afterHead[0].length)
    );
  }
  return linkBlock + html;
}

async function main() {
  const cssFiles = await readCssFiles();
  const linkBlock = buildLinkTags(cssFiles);
  console.log(`[patch-css-links] ${cssFiles.length} CSS file(s):`);
  for (const f of cssFiles) console.log(`  - ${basePath}/_next/static/css/${f}`);

  let count = 0;
  for await (const file of walkHtml(outDir)) {
    const orig = await readFile(file, 'utf8');
    const cleaned = removeOldLinks(orig);
    if (cleaned === orig && orig.includes(linkBlock)) {
      // Already patched, nothing to do.
      continue;
    }
    const next = injectLinks(cleaned, linkBlock);
    if (next !== orig) {
      await writeFile(file, next, 'utf8');
      count += 1;
    }
  }
  console.log(`[patch-css-links] patched ${count} HTML file(s) in ${relative(repoRoot, outDir) || '.'}`);
}

main().catch((err) => {
  console.error('[patch-css-links] failed:', err);
  process.exit(1);
});
