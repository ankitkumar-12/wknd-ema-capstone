/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from './parsers/breadcrumbs.js';
import quoteParser from './parsers/quote.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import { stampCategory } from './category-map.js';

const parsers = {
  breadcrumbs: breadcrumbsParser,
  quote: quoteParser,
};

const transformers = [wkndCleanupTransformer];

const PAGE_TEMPLATE = {
  name: "article-detail",
  description: "Long-form article page with a hero image, title and byline, prose body with inline images and subheadings, and a related-links sidebar",
  urls: [
    "https://wknd.site/us/en/magazine/arctic-surfing.html",
    "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
    "https://wknd.site/us/en/magazine/san-diego-surf.html",
    "https://wknd.site/us/en/magazine/ski-touring.html",
    "https://wknd.site/us/en/magazine/western-australia.html"
  ],
  blocks: [
    {
      "name": "breadcrumbs",
      "instances": [
        ".breadcrumb.aem-GridColumn",
        ".breadcrumb"
      ]
    },
    {
      "name": "quote",
      "instances": [
        "blockquote",
        ".cmp-text blockquote"
      ]
    }
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const claimed = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (claimed.has(element)) return;
        claimed.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // stamp a Category metadata field (indexed + used by the cards listings)
    stampCategory(main, document, new URL(params.originalURL).pathname);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
