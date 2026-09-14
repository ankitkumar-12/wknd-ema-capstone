/*
 * Breadcrumbs Block
 * Renders an authored trail of links as an accessible breadcrumb navigation.
 * Authors provide the trail as a list (or rows) of links; the last item is the
 * current page. Decorates defensively — works with a <ul>/<ol>, links in rows,
 * or a single current-page label.
 */

export default function decorate(block) {
  // collect trail items: prefer an authored list, else each row's link/text
  let items = [...block.querySelectorAll('li')];
  if (!items.length) {
    items = [...block.children].map((row) => row.firstElementChild || row);
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs-list';

  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';
    const link = item.querySelector('a');
    const isLast = i === items.length - 1;
    if (link && !isLast) {
      li.append(link);
    } else {
      // current page (or a non-linked crumb) — plain text
      const span = document.createElement('span');
      span.textContent = (link || item).textContent.trim();
      if (isLast) span.setAttribute('aria-current', 'page');
      li.append(span);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
