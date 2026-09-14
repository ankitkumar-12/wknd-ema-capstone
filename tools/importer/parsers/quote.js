/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: quote (base block: quote)
 * Source: https://wknd.site/us/en/magazine/arctic-surfing.html
 *   page-templates selectors: .cmp-contentfragment__element--quote, .quote
 *   (real authored markup is a <blockquote> inside a .cmp-text element).
 * Generated: 2026-09-14
 *
 * Target table (quote.js decorate): first row = quotation text (single cell),
 *   optional second row = attribution (author/source). Both are 1-column rows.
 * Source: quotation lives in a <blockquote> (or the matched quote element);
 *   attribution, if present, follows as a cite/footer/small or trailing line.
 */
export default function parse(element, { document }) {
  // Locate the quotation text.
  const bq = element.querySelector('blockquote');
  const quoteEl = bq || element;
  const quoteText = quoteEl.textContent.replace(/\s+/g, ' ').trim();

  // Locate an optional attribution (author / source).
  const attrEl = element.querySelector('cite, footer, .cmp-quote__author, .author, [class*="author"], [class*="attribution"], small');
  const attrText = attrEl ? attrEl.textContent.replace(/\s+/g, ' ').trim() : '';

  // Empty-block guard
  if (!quoteText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  const quotePara = document.createElement('p');
  quotePara.textContent = quoteText;
  cells.push([quotePara]);

  if (attrText && attrText !== quoteText) {
    const attrPara = document.createElement('p');
    attrPara.textContent = attrText;
    cells.push([attrPara]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
  element.replaceWith(block);
}
