/* eslint-disable */
/* global WebImporter */

/**
 * Parser for the index-driven `cards` block (base block: cards).
 *
 * The migrated cards block is EMPTY at author time — it renders from
 * /query-index.json at runtime. So instead of emitting one row per hardcoded
 * card, this parser emits an empty block plus a small two-column config table:
 *
 *   | Cards  |
 *   | path   | /us/en/magazine/ |
 *   | limit  | 4                |     (omitted on the listing page itself)
 *
 * The `path` prefix is derived automatically from the authored card links, so
 * publishing a new page under that prefix makes it appear with no further edit.
 */
export default function parse(element, { document, params }) {
  // collect the internal /us/en links the source cards point at
  const links = Array.from(element.querySelectorAll('a[href]'))
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h.startsWith('/us/en/'))
    .map((h) => h.replace(/\.html?(?=$|[?#])/, ''));

  if (!links.length) {
    // nothing to key off — drop the block rather than emit an empty shell
    element.replaceWith(...element.childNodes);
    return;
  }

  // common directory prefix of the linked detail pages, e.g. "/us/en/magazine/"
  const dirs = links.map((h) => h.slice(0, h.lastIndexOf('/') + 1));
  const path = dirs.sort((a, b) => a.length - b.length)[0];

  const config = [['path', path]];

  // if this block lives on the listing page for that prefix, show everything;
  // otherwise it is a capped rail on another page — preserve the authored count
  const pagePath = (() => {
    try {
      return new URL(params.originalURL).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
    } catch (e) {
      return '';
    }
  })();
  const listingPath = path.replace(/\/$/, '');
  if (pagePath !== listingPath) {
    const uniqueCount = new Set(links).size;
    config.push(['limit', String(uniqueCount)]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells: config });
  element.replaceWith(block);
}
