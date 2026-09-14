/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards (base block: cards)
 * Source: https://wknd.site/us/en/magazine.html  (selector: .image-list.list)
 * Generated: 2026-09-14
 *
 * Library convention: 2 columns, one row per card —
 *   cell 1 = image (mandatory), cell 2 = text (title as heading, description, optional CTA).
 * Source: AEM Core Components image-list — .cmp-image-list__item with
 *   .cmp-image-list__item-image (img), .cmp-image-list__item-title-link and
 *   .cmp-image-list__item-description.
 */
export default function parse(element, { document }) {
  // Prefer image-list items; fall back to generic list items / rows.
  let items = Array.from(element.querySelectorAll('.cmp-image-list__item'));
  if (!items.length) items = Array.from(element.querySelectorAll('li'));

  const cells = [];

  items.forEach((item) => {
    // Image cell
    const img = item.querySelector('img');
    const imageCell = img || '';

    // Text cell: title (linked heading) + description
    const body = [];
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleEl = item.querySelector('.cmp-image-list__item-title, [class*="title"]');
    const titleText = (titleEl ? titleEl.textContent : (titleLink ? titleLink.textContent : (img ? img.getAttribute('alt') : '')) || '').trim();
    if (titleText) {
      const h = document.createElement('h3');
      const href = titleLink && titleLink.getAttribute('href');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleText;
        h.append(a);
      } else {
        h.textContent = titleText;
      }
      body.push(h);
    }
    const descEl = item.querySelector('.cmp-image-list__item-description, [class*="description"], p');
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      body.push(p);
    }

    if (img || body.length) {
      cells.push([imageCell, body]);
    }
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
