/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion (base block: accordion)
 * Source: https://wknd.site/us/en/faqs.html  (selector: .accordion.panelcontainer)
 * Generated: 2026-09-14
 *
 * Library convention: 2 columns, one row per accordion item —
 *   cell 1 = title/label (mandatory), cell 2 = content body (mandatory).
 * Source: AEM Core Components accordion — .cmp-accordion__item with
 *   .cmp-accordion__title (question) and .cmp-accordion__panel (answer body).
 */
export default function parse(element, { document }) {
  // Prefer Core Component items; fall back to generic details/rows.
  let items = Array.from(element.querySelectorAll('.cmp-accordion__item'));
  if (!items.length) items = Array.from(element.querySelectorAll('details'));

  const cells = [];

  items.forEach((item) => {
    // Title: the title span, else the header/summary/button text.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, summary, [class*="title"], h1, h2, h3, h4, h5, h6');
    const title = document.createElement('p');
    title.textContent = (titleEl ? titleEl.textContent : '').trim();

    // Content: the panel body content, else the item body after the header.
    const panel = item.querySelector('.cmp-accordion__panel, [data-cmp-hook-accordion="panel"]');
    const content = panel || item.querySelector('div') || item;

    if (title.textContent || (content && content.textContent.trim())) {
      cells.push([title, content]);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
