/* eslint-disable no-restricted-syntax, no-console */
/*
 * Builds the static header-search fallback index from imported content.
 *
 * Scans content/us/**.plain.html, extracts each page's path, title and
 * description, and writes us/en/search-index.json in query-index sheet shape.
 * Used only until a live query-index.json is configured at tools.aem.live —
 * see the "Search" section in README.md.
 *
 * Usage: node tools/importer/build-search-index.js
 */
const fs = require('fs');
const path = require('path');

const CONTENT_ROOT = 'content/us';
const OUTPUT = 'us/en/search-index.json';

function collectPlainHtml(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectPlainHtml(full, acc);
    else if (entry.name.endsWith('.plain.html')) acc.push(full);
  }
  return acc;
}

function extract(html, pagePath) {
  const title = html.match(/<div>Title<\/div><div>([^<]*)<\/div>/);
  const description = html.match(/<div>Description<\/div><div>([^<]*)<\/div>/);
  const heading = html.match(/<h1[^>]*>([^<]*)<\/h1>/) || html.match(/<h2[^>]*>([^<]*)<\/h2>/);
  return {
    path: pagePath,
    title: ((title && title[1]) || (heading && heading[1]) || pagePath).trim(),
    description: ((description && description[1]) || '').trim(),
  };
}

function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(`No content at ${CONTENT_ROOT} — run the content import first.`);
    process.exit(1);
  }
  const files = collectPlainHtml(CONTENT_ROOT, []).sort();
  const data = files.map((file) => {
    const pagePath = `/${file.replace(/^content\//, '').replace(/\.plain\.html$/, '')}`;
    return extract(fs.readFileSync(file, 'utf8'), pagePath);
  });
  const index = {
    total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));
  console.log(`Wrote ${OUTPUT} with ${data.length} entries.`);
}

main();
