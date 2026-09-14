/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel (base block: carousel)
 * Source: https://wknd.site/us/en.html  (selector: .carousel.panelcontainer)
 * Generated: 2026-09-14
 *
 * Library convention: 2 columns, one row per slide —
 *   cell 1 = image (mandatory, no other content),
 *   cell 2 = optional text (title as heading, description, optional CTA).
 * Source: AEM Core Components carousel — .cmp-carousel__item, each holding a
 *   .cmp-teaser with .cmp-teaser__title, .cmp-teaser__description,
 *   .cmp-teaser__action-link and a .cmp-teaser__image img.
 */
export default function parse(element, { document }) {
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  if (!slides.length) slides = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  slides.forEach((slide) => {
    const teaser = slide.querySelector('.cmp-teaser') || slide;

    // Image cell (first cell, image only)
    const img = teaser.querySelector('img');

    // Text cell: heading + description + CTA(s)
    const content = [];
    const titleEl = teaser.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6');
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

    if (!img && !content.length) return;
    // Every row has 2 cells; pad the text cell with '' when the slide is image-only.
    cells.push([img || '', content.length ? content : '']);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
