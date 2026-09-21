import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';

/**
 * Index-driven cards.
 *
 * The authored block is an EMPTY block plus a small two-column config table,
 * e.g.
 *   | Cards            |
 *   | path     | /us/en/magazine/ |
 *   | limit    | 5                |
 *   | category | Skiing           |   (optional)
 *   | group    | category         |   (optional — renders category tabs)
 *   | sort     | lastModified     |   (optional — default; desc)
 *
 * At runtime it reads /query-index.json, filters rows to those whose path
 * starts with the authored `path` prefix (and optional `category`), sorts them,
 * and builds cards from the index rows. Publishing a new page under the prefix
 * makes it appear here automatically — no code change, no edit to any page.
 */

// cache the index fetch across every cards block on the page. The live query
// index (/query-index.json) is the single source of truth.
let indexPromise;
async function loadIndex() {
  if (indexPromise) return indexPromise;
  indexPromise = (async () => {
    try {
      const resp = await fetch('/query-index.json');
      if (!resp.ok) return [];
      const json = await resp.json();
      if (json && Array.isArray(json.data)) return json.data;
    } catch (e) { /* index unavailable */ }
    return [];
  })();
  return indexPromise;
}

// Fallback path→category map. The query index is the source of truth for
// `category`, but on tools.aem.live-managed sites that property only appears
// once it is registered in the index config and reindexed. Until then the
// index omits `category` and the /adventures tabs would collapse to just
// "All". This served map (generated from tools/importer/category-map.js, the
// same values stamped as each page's `Category` metadata) lets the block
// backfill the category so the tabs work regardless. Real index values always
// take precedence — see mergeCategories().
let categoryMapPromise;
async function loadCategoryMap() {
  if (categoryMapPromise) return categoryMapPromise;
  categoryMapPromise = (async () => {
    try {
      const resp = await fetch('/category-map.json');
      if (!resp.ok) return {};
      const json = await resp.json();
      if (json && json.data && typeof json.data === 'object') return json.data;
    } catch (e) { /* map unavailable */ }
    return {};
  })();
  return categoryMapPromise;
}

/**
 * Returns index rows with `category` backfilled from the fallback map for any
 * row the index left without one. Rows that already carry a `category` from the
 * index are left untouched (the index remains the source of truth).
 */
function mergeCategories(data, map) {
  if (!map || !Object.keys(map).length) return data;
  return data.map((row) => {
    if (row.category || !row.path) return row;
    const fallback = map[row.path] || map[row.path.replace(/\/$/, '')];
    return fallback ? { ...row, category: fallback } : row;
  });
}

/** Split a multi-value metadata string ("Cycling, Travel") into a clean array. */
function toCategories(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Filters + sorts index rows for a listing.
 * @param {Array} data the raw index rows
 * @param {object} cfg { path, category, sort, limit }
 */
function selectRows(data, cfg) {
  const prefix = cfg.path;
  let rows = data.filter((row) => row.path && row.path.startsWith(prefix)
    // a prefix like /us/en/magazine/ must not match the listing page itself
    && row.path !== prefix.replace(/\/$/, ''));

  if (cfg.category) {
    const wanted = cfg.category.toLowerCase();
    rows = rows.filter((row) => toCategories(row.category)
      .some((c) => c.toLowerCase() === wanted));
  }

  const sortKey = cfg.sort || 'lastModified';
  rows.sort((a, b) => {
    const av = a[sortKey] || '';
    const bv = b[sortKey] || '';
    // lastModified is a numeric (or ISO) timestamp → newest first
    if (sortKey === 'lastModified') return Number(bv) - Number(av);
    return String(av).localeCompare(String(bv));
  });

  const limit = parseInt(cfg.limit, 10);
  if (!Number.isNaN(limit) && limit > 0) rows = rows.slice(0, limit);
  return rows;
}

/** Builds a single card <li> from an index row. */
function buildCard(row) {
  const li = document.createElement('li');

  if (row.image) {
    const imageDiv = document.createElement('div');
    imageDiv.className = 'cards-card-image';
    // wrap the image in a link to the article so the whole teaser (image
    // included) is clickable, matching the source. Uses the same URL as the
    // title link below.
    const imageLink = document.createElement('a');
    imageLink.className = 'cards-card-image-link';
    imageLink.href = row.path;
    imageLink.setAttribute('aria-label', row.title || row.path);
    imageLink.setAttribute('tabindex', '-1');
    imageLink.append(createOptimizedPicture(row.image, row.title || '', false, [{ width: '750' }]));
    imageDiv.append(imageLink);
    li.append(imageDiv);
  }

  const body = document.createElement('div');
  body.className = 'cards-card-body';
  const h3 = document.createElement('h3');
  const a = document.createElement('a');
  a.href = row.path;
  a.textContent = row.title || row.path;
  h3.append(a);
  body.append(h3);
  if (row.description) {
    const p = document.createElement('p');
    p.textContent = row.description;
    body.append(p);
  }
  li.append(body);
  return li;
}

/** Builds a <ul> of cards from index rows. */
function buildList(rows) {
  const ul = document.createElement('ul');
  rows.forEach((row) => ul.append(buildCard(row)));
  return ul;
}

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // Backwards-compatible / defensive: without a `path` prefix there is nothing
  // to query, so render nothing rather than an empty shell.
  if (!cfg.path) return;

  let data = await loadIndex();

  // Backfill `category` from the served fallback map when the index omits it,
  // but only when a category is actually needed (grouping or filtering).
  if (cfg.group === 'category' || cfg.category) {
    data = mergeCategories(data, await loadCategoryMap());
  }

  // grouped variant: render one tab per category with its own cards grid
  if (cfg.group === 'category') {
    const all = selectRows(data, { ...cfg, category: undefined, limit: undefined });
    const cats = [...new Set(all.flatMap((row) => toCategories(row.category)))].sort();
    const tabs = ['All', ...cats];

    const tablist = document.createElement('div');
    tablist.className = 'cards-tabs';
    tablist.setAttribute('role', 'tablist');

    const panels = document.createElement('div');
    panels.className = 'cards-panels';

    tabs.forEach((tab, idx) => {
      const rows = tab === 'All'
        ? all
        : all.filter((row) => toCategories(row.category)
          .some((c) => c.toLowerCase() === tab.toLowerCase()));

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cards-tab';
      btn.setAttribute('role', 'tab');
      btn.textContent = tab;
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');

      const panel = document.createElement('div');
      panel.className = 'cards-panel';
      panel.setAttribute('role', 'tabpanel');
      if (idx !== 0) panel.hidden = true;
      panel.append(buildList(rows));

      btn.addEventListener('click', () => {
        tablist.querySelectorAll('.cards-tab').forEach((b) => b.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');
        panels.querySelectorAll('.cards-panel').forEach((p) => { p.hidden = true; });
        panel.hidden = false;
      });

      tablist.append(btn);
      panels.append(panel);
    });

    block.append(tablist, panels);
    return;
  }

  // default: a single flat grid of cards
  const rows = selectRows(data, cfg);
  block.append(buildList(rows));
}
