/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero (base block: hero)
 * Source: https://wknd.site/us/en/adventures.html  (selector: .teaser.cmp-teaser--hero)
 *         also .teaser.cmp-teaser--featured (homepage / magazine / about-us)
 * Generated: 2026-09-14
 *
 * Library convention: 1 column, up to 3 rows —
 *   row 1 = block name, row 2 = single cell with the background image (optional),
 *   row 3 = single cell with title (heading) + subheading + CTA (optional).
 * Source: AEM Core Components teaser — .cmp-teaser__image img plus
 *   .cmp-teaser__content (.cmp-teaser__pretitle, .cmp-teaser__title,
 *   .cmp-teaser__description, .cmp-teaser__action-link).
 */
export default function parse(element, { document }) {
  const teaser = element.querySelector('.cmp-teaser') || element;

  // Background image row
  const img = teaser.querySelector('img');

  // Content row: pretitle + heading + description + CTA(s)
  const content = [];
  const pretitle = teaser.querySelector('.cmp-teaser__pretitle');
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    content.push(p);
  }
  const titleEl = teaser.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (titleEl && titleEl.textContent.trim()) {
    const h = document.createElement('h2');
    h.textContent = titleEl.textContent.trim();
    content.push(h);
  }
  const descEl = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
  if (descEl && descEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = descEl.textContent.trim();
    content.push(p);
  }
  teaser.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a').forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    content.push(link);
  });

  // Empty-block guard
  if (!img && !content.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // 1-column block: image row, then content row (each is a single cell).
  const cells = [];
  cells.push([img || '']);
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
