/*
 * Quote Block
 * A pull-quote with the quotation text and an optional attribution line.
 * Decorates defensively: the attribution row is optional.
 */

export default function decorate(block) {
  const rows = [...block.children];

  // first row = quotation text
  const [quoteRow, attributionRow] = rows;

  if (quoteRow) {
    const quote = quoteRow.firstElementChild || quoteRow;
    quote.classList.add('quote-text');
    // use a semantic blockquote wrapper around the quotation content
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'quote-quotation';
    blockquote.append(...quote.childNodes);
    quote.replaceChildren(blockquote);
  }

  // optional second row = attribution (author / source)
  if (attributionRow) {
    const attribution = attributionRow.firstElementChild || attributionRow;
    attribution.classList.add('quote-attribution');
  }
}
