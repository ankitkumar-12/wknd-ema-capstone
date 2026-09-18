/* eslint-disable no-restricted-syntax, no-console */
/*
 * Builds the static fallback index from imported content — a local stand-in
 * for the live query-index (same sheet shape) used by the header search AND the
 * index-driven cards listings until /query-index.json is configured/published.
 *
 * Scans content/us/**.plain.html and extracts each page's path, title,
 * description, image, category and lastModified. See README "Search" / the
 * query index notes; helix-query.yaml is the live index definition.
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

function extract(html, pagePath, mtime) {
  const title = html.match(/<div>Title<\/div><div>([^<]*)<\/div>/);
  const description = html.match(/<div>Description<\/div><div>([^<]*)<\/div>/);
  const category = html.match(/<div>Category<\/div><div>([^<]*)<\/div>/);
  const heading = html.match(/<h1[^>]*>([^<]*)<\/h1>/) || html.match(/<h2[^>]*>([^<]*)<\/h2>/);
  // first content image = the card thumbnail (mirrors og:image on the live index)
  const image = html.match(/<img[^>]*\bsrc="([^"]+)"/i);
  return {
    path: pagePath,
    title: ((title && title[1]) || (heading && heading[1]) || pagePath).trim(),
    description: ((description && description[1]) || '').trim(),
    image: (image && image[1]) ? image[1].trim() : '',
    category: (category && category[1]) ? category[1].trim() : '',
    // sortable recency proxy — real query-index uses the page's last-modified
    lastModified: String(mtime),
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
    const mtime = Math.round(fs.statSync(file).mtimeMs);
    return extract(fs.readFileSync(file, 'utf8'), pagePath, mtime);
  });
  const index = {
    total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
  };
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));
  console.log(`Wrote ${OUTPUT} with ${data.length} entries.`);
}

main();
