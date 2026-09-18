/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs (base block: tabs)
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html  (selector: .tabs.panelcontainer)
 * Generated: 2026-09-14
 *
 * Library convention: 2 columns, one row per tab —
 *   cell 1 = tab label (mandatory), cell 2 = tab content (mandatory).
 * Source: AEM Core Components tabs — .cmp-tabs__tablist .cmp-tabs__tab (labels)
 *   paired positionally with .cmp-tabs__tabpanel (panel bodies).
 *
 * SPECIAL CASE — the /adventures listing uses these same tabs to group trip
 * TEASER CARDS by category (All/Climbing/Cycling/…). That grid is now
 * index-driven: when the panels are lists of /us/en/adventures/ links (not
 * prose like an adventure-detail Overview/Itinerary), emit an EMPTY, grouped
 * `Cards` block (path + group=category) instead of a tabs block, so publishing
 * a new adventure adds it to the right tab automatically.
 */

/** True when the tabs are the adventures category grid (panels of trip links). */
function isAdventureCardGrid(element) {
  const links = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel a[href]'))
    .map((a) => a.getAttribute('href') || '');
  const adventureLinks = links.filter((h) => /\/us\/en\/adventures\/[^/]+/.test(h));
  // needs several trip links and an "All" style aggregate tab to be the grid
  return adventureLinks.length >= 4;
}

function parseAsIndexCards(element, document) {
  const links = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel a[href]'))
    .map((a) => (a.getAttribute('href') || '').replace(/\.html?(?=$|[?#])/, ''))
    .filter((h) => /^\/us\/en\/adventures\/[^/]+$/.test(h));
  const dirs = links.map((h) => h.slice(0, h.lastIndexOf('/') + 1));
  const path = dirs.sort((a, b) => a.length - b.length)[0] || '/us/en/adventures/';

  const config = [
    ['path', path],
    ['group', 'category'],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells: config });
  element.replaceWith(block);
}

export default function parse(element, { document }) {
  if (isAdventureCardGrid(element)) {
    parseAsIndexCards(element, document);
    return;
  }

  const labels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  panels.forEach((panel, i) => {
    // Tab label from the matching tab, else the panel's aria-label / heading.
    const labelSrc = labels[i];
    const labelText = (labelSrc
      ? labelSrc.textContent
      : (panel.getAttribute('aria-label')
        || (panel.querySelector('h1, h2, h3, h4, h5, h6') || {}).textContent
        || `Tab ${i + 1}`)).trim();

    const label = document.createElement('p');
    label.textContent = labelText;

    // Panel content: only unwrap to a single inner content fragment when there
    // is exactly one — a panel holding a LIST of articles (e.g. a filterable
    // card grid) must keep ALL of them, so fall back to the whole panel.
    const wrappers = panel.querySelectorAll('.cmp-contentfragment, .contentfragment');
    const articles = panel.querySelectorAll('article');
    let content = panel;
    if (wrappers.length === 1) {
      [content] = wrappers;
    } else if (wrappers.length === 0 && articles.length === 1) {
      [content] = articles;
    }

    cells.push([label, content]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
