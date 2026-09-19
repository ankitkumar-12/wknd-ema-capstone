/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns (base block: columns)
 * Source: https://wknd.site/us/en/magazine.html
 *   selector: the "Members Only" locked promos — .teaser.cmp-teaser--list.cmp-teaser--secure
 * Generated: 2026-09-18
 *
 * The magazine "Members Only" area is two locked teaser cards side by side
 * (Alaskan Adventure, Fly Fishing the Amazon), each a heading with a yellow
 * lock badge, an uppercase description, a "Read More" action, and a compact
 * teaser image below the text. We render them as one `columns` block (the
 * members-teaser variant): a single row whose cells are the two teasers, so CSS
 * lays them out as a responsive two-up grid.
 *
 * Per the columns convention: row 1 = block name (+ variant), row 2 = one cell
 * per column. This parser collects ALL matched secure teasers into that single
 * second row and replaces the first teaser with the block, dropping the rest.
 */
function buildColumn(teaser, document) {
  const col = document.createElement('div');

  // heading
  const titleEl = teaser.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (titleEl && titleEl.textContent.trim()) {
    const h = document.createElement('h3');
    h.textContent = titleEl.textContent.trim();
    col.append(h);
  }

  // description
  const descEl = teaser.querySelector('.cmp-teaser__description, [class*="description"]');
  if (descEl && descEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = descEl.textContent.trim();
    col.append(p);
  }

  // action ("Read More") — may be a link or plain text in the source
  const actionEl = teaser.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a');
  const actionContainer = teaser.querySelector('.cmp-teaser__action-container');
  if (actionEl && actionEl.getAttribute('href')) {
    const a = document.createElement('a');
    a.href = actionEl.getAttribute('href');
    a.textContent = actionEl.textContent.trim() || 'Read More';
    const p = document.createElement('p');
    p.append(a);
    col.append(p);
  } else if (actionContainer && actionContainer.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = actionContainer.textContent.trim();
    col.append(p);
  }

  // image (rendered below the text by CSS)
  const img = teaser.querySelector('img');
  if (img) {
    const p = document.createElement('p');
    p.append(img);
    col.append(p);
  }

  return col;
}

export default function parse(element, { document }) {
  // Idempotent: once the block is built, later invocations for the sibling
  // teasers just remove the now-consumed element.
  if (element.dataset.membersTeaserConsumed) {
    element.remove();
    return;
  }

  const root = element.closest('main, body') || document.body;
  const teasers = [...root.querySelectorAll('.teaser.cmp-teaser--list.cmp-teaser--secure')];
  if (!teasers.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // second row: one cell per teaser (column)
  const row = teasers.map((teaser) => {
    teaser.dataset.membersTeaserConsumed = '1';
    return buildColumn(teaser, document);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (members-teaser)',
    cells: [row],
  });

  teasers[0].replaceWith(block);
  teasers.slice(1).forEach((t) => t.remove());
}
