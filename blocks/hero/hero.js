/*
 * Hero Block
 * A full-width background image with an optional overlaid content panel
 * (heading, text, CTA). Decorates defensively: the panel and/or image may be
 * omitted, and cells may appear in any order.
 */
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // classify each cell as image or content
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && cell.textContent.trim() === '') {
        cell.classList.add('hero-image');
      } else if (cell.textContent.trim() !== '' || cell.querySelector('a, h1, h2, h3')) {
        cell.classList.add('hero-content');
      }
    });
  });

  // fallback: a lone picture with no explicit cells becomes the background image
  if (!block.querySelector('.hero-image')) {
    const pic = block.querySelector('picture');
    const wrapper = pic && pic.closest('div');
    if (wrapper) wrapper.classList.add('hero-image');
  }

  // Route images through createOptimizedPicture so they ship with an optimized,
  // sized srcset — the browser can reserve space and avoid layout shift (CLS).
  // The hero image is the LCP element, so load it eagerly.
  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, true),
    );
  });
}
