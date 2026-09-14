/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: breadcrumbs (base block: breadcrumbs)
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html  (selector: .breadcrumb)
 * Generated: 2026-09-14
 *
 * Target: single cell containing the trail as a list of links; the final item is
 * the current page (rendered as plain text). breadcrumbs.js decorate reads the
 * authored <li> items (or one link per row), last item = current page.
 * Source: AEM Core Components breadcrumb — .cmp-breadcrumb__list > .cmp-breadcrumb__item,
 *   non-active items hold an <a>, the active/current item is a plain label.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-breadcrumb__item, li'));

  const list = document.createElement('ul');

  items.forEach((item) => {
    const li = document.createElement('li');
    const link = item.querySelector('a');
    const isCurrent = item.getAttribute('aria-current') === 'page'
      || /--active|current/i.test(item.className)
      || !link;

    if (link && !isCurrent) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      li.append(a);
    } else {
      // current page (or non-linked crumb) → plain text label
      li.textContent = (link || item).textContent.trim();
    }
    if (li.textContent.trim()) list.append(li);
  });

  // Empty-block guard
  if (!list.children.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[list]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
