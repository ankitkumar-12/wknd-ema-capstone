import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

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

  block.append(footer);
}
