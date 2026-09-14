/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable AEM site chrome and layout wrappers so the import
 * contains only page-level authorable content. All selectors below were
 * verified against the captured DOM in catalog/.pages/*.page-catalog.json
 * (AEM WKND demo — Core Components markup).
 *
 * NOTE: Breadcrumbs (.breadcrumb / .cmp-breadcrumb--fixed) are intentionally
 * NOT removed here — they are mapped as an authorable "breadcrumbs" block in
 * page-templates.json (adventure-detail, article-detail) and are extracted by
 * a parser.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Elements that could interfere with block parsing / matching.
    // Verified in captured DOM: global header/footer are AEM experience fragments.
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment.cmp-experiencefragment--header', // global site header/nav (verified: _global/header.json)
      'footer.experiencefragment.cmp-experiencefragment--footer', // global site footer (verified: _global/footer.json)
      '#mobileNav', // hidden mobile navigation tree (Home/Magazine/…) — not authorable
      '#toggleNav', // "Open hidden mobile navigation" toggle
      '.cmp-navigation--mobile', // mobile nav container (belt-and-suspenders)
      '.cmp-languagenavigation', // language switcher — site chrome
    ]);

    // Non-content elements never authored on a page.
    WebImporter.DOMUtils.remove(element, [
      'style',
      'script',
      'noscript',
      'link',
      'template',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Belt-and-suspenders: strip any header/footer chrome still present after
    // block parsing (e.g. if a fragment survived under a different wrapper).
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment.cmp-experiencefragment--header',
      'footer.experiencefragment.cmp-experiencefragment--footer',
      'header',
      'footer',
    ]);

    // Remove leftover non-authorable / non-visible elements.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'source',
      'noscript',
      'link',
    ]);

    // Strip AEM authoring/analytics attributes left on content elements.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('data-cmp-hook-teaser');
      el.removeAttribute('data-cmp-hook-carousel');
      el.removeAttribute('data-cmp-clickable');
      el.removeAttribute('onclick');
    });

    // De-duplicate the page title: WKND adventure/detail pages repeat the H1
    // title as an H3 in the metadata region and inside each tab panel. Keep the
    // first H1 and drop any later h2–h4 with identical text.
    const h1 = element.querySelector('h1');
    if (h1) {
      const titleText = h1.textContent.trim().toLowerCase();
      element.querySelectorAll('h2, h3, h4').forEach((heading) => {
        if (heading.textContent.trim().toLowerCase() === titleText) {
          heading.remove();
        }
      });
    }

    // Strip the ".html" suffix from internal, same-origin links: on EDS the
    // extensionless path is canonical (/us/en/adventures.html 404s, /us/en/
    // adventures is 200). Only touch relative paths ("/…"); leave external
    // links, anchors, mailto/tel and query/hash fragments intact.
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('/')) {
        a.setAttribute('href', href.replace(/\.html(?=$|[?#])/, ''));
      }
    });
  }
}
