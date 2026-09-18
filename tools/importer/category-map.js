/* eslint-disable */
/**
 * Path → category mapping for the WKND /us/en migration.
 *
 * The source /adventures page grouped trips into category tabs
 * (Climbing/Cycling/Skiing/Surfing/Travel — several trips belong to more than
 * one). Magazine articles are all a single "Magazine" category. We stamp this
 * as a `Category` metadata field per detail page at import time so the query
 * index can expose it and the index-driven cards block can filter/group by it.
 *
 * Multi-value categories are comma-separated (readBlockConfig-friendly and the
 * cards block splits on commas).
 *
 * After migration, authors maintain `Category` per page in Document Authoring;
 * a new page then appears in listings from its own metadata with no other edit.
 */

// adventure slug → categories (from the source /adventures tab grouping)
const ADVENTURE_CATEGORIES = {
  'bali-surf-camp': ['Surfing'],
  'beervana-portland': ['Travel'],
  'climbing-new-zealand': ['Climbing'],
  'colorado-rock-climbing': ['Climbing'],
  'cycling-southern-utah': ['Cycling'],
  'cycling-tuscany': ['Cycling', 'Travel'],
  'downhill-skiing-wyoming': ['Skiing'],
  'gastronomic-marais-tour': ['Travel'],
  'napa-wine-tasting': ['Travel'],
  'riverside-camping-australia': ['Travel'],
  'ski-touring-mont-blanc': ['Skiing'],
  'surf-camp-costa-rica': ['Surfing'],
  'tahoe-skiing': ['Skiing'],
  'west-coast-cycling': ['Cycling'],
  'whistler-mountain-biking': ['Cycling'],
  'yosemite-backpacking': ['Travel'],
};

/**
 * Returns the comma-separated category string for a page path, or '' if none.
 * @param {string} pathname e.g. "/us/en/adventures/tahoe-skiing"
 */
export function categoryForPath(pathname) {
  const p = (pathname || '').replace(/\.html?$/, '').replace(/\/$/, '');
  const adv = p.match(/^\/us\/en\/adventures\/([^/]+)$/);
  if (adv) return (ADVENTURE_CATEGORIES[adv[1]] || []).join(', ');
  // any magazine article (but not the /magazine landing page itself)
  if (/^\/us\/en\/magazine\/[^/]+$/.test(p)) return 'Magazine';
  return '';
}

/**
 * Appends a `Category` row to the page's metadata block (creating the block if
 * needed). Call AFTER WebImporter.rules.createMetadata so the block exists.
 * @param {Element} main the import root
 * @param {Document} document
 * @param {string} pathname the page's path
 */
export function stampCategory(main, document, pathname) {
  const category = categoryForPath(pathname);
  if (!category) return;

  // find the metadata block createMetadata produced (2-col table whose first
  // cell reads "Metadata"), else the last .metadata table
  let table = [...main.querySelectorAll('table')].find((t) => {
    const first = t.querySelector('tr th, tr td');
    return first && first.textContent.trim().toLowerCase() === 'metadata';
  });
  if (!table) return;

  const row = document.createElement('tr');
  const key = document.createElement('td');
  key.textContent = 'Category';
  const val = document.createElement('td');
  val.textContent = category;
  row.append(key, val);
  table.append(row);
}
