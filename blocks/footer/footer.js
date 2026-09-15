import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// inline SVG glyphs for the social icon buttons (match the source's boxed
// Facebook / Twitter / Instagram icons)
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.49-1.46H17V3.96A20 20 0 0 0 14.68 3.84c-2.3 0-3.88 1.4-3.88 3.98V10H8.1v3h2.7v8z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22 5.9c-.7.32-1.5.53-2.3.63a4 4 0 0 0 1.77-2.22 8 8 0 0 1-2.55.98A4 4 0 0 0 11.9 9a11.4 11.4 0 0 1-8.28-4.2 4 4 0 0 0 1.25 5.36c-.65-.02-1.26-.2-1.8-.5v.05a4 4 0 0 0 3.22 3.94c-.6.16-1.23.18-1.82.07a4 4 0 0 0 3.74 2.78A8.05 8.05 0 0 1 2 18.13a11.35 11.35 0 0 0 6.16 1.8c7.39 0 11.43-6.12 11.43-11.43v-.52A8.2 8.2 0 0 0 22 5.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.44c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.17.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.17 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.17-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.41-2.19a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.42-.17-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 3.68a4.72 4.72 0 1 0 0 9.44 4.72 4.72 0 0 0 0-9.44zm0 7.79a3.07 3.07 0 1 1 0-6.14 3.07 3.07 0 0 1 0 6.14zm6.01-7.98a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/></svg>',
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // the WKND brand is a plain wordmark in the source footer, not a CTA — undo
  // any .button promotion applied to it by decorateButtons
  footer.querySelectorAll('a.button').forEach((a) => {
    a.className = '';
    const wrapper = a.closest('.button-container, .button-wrapper');
    if (wrapper) wrapper.className = 'footer-brand';
  });

  // the "Follow Us" social links are boxed icon buttons in the source, not
  // plain text — find the paragraph holding them and swap each link's text for
  // its matching icon glyph
  const socialPara = [...footer.querySelectorAll('p')].find((p) => {
    const links = [...p.querySelectorAll('a')];
    return links.length > 0 && links.every((a) => /facebook|twitter|instagram/i.test(a.getAttribute('href') || a.textContent));
  });
  if (socialPara) {
    socialPara.classList.add('footer-social');
    socialPara.querySelectorAll('a').forEach((a) => {
      const key = Object.keys(SOCIAL_ICONS).find((k) => new RegExp(k, 'i').test(a.getAttribute('href') || a.textContent));
      if (!key) return;
      a.setAttribute('aria-label', a.textContent.trim() || key);
      a.classList.add('footer-social-icon', `footer-social-icon--${key}`);
      a.innerHTML = SOCIAL_ICONS[key];
    });
  }

  block.append(footer);
}
