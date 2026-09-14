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
 */
export default function parse(element, { document }) {
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
