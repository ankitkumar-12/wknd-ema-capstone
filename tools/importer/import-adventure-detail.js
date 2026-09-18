/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from './parsers/breadcrumbs.js';
import carouselParser from './parsers/carousel.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import { stampCategory } from './category-map.js';

const parsers = {
  breadcrumbs: breadcrumbsParser,
  carousel: carouselParser,
  tabs: tabsParser,
};

const transformers = [wkndCleanupTransformer];

const PAGE_TEMPLATE = {
  name: "adventure-detail",
  description: "Detail page with a carousel hero, a left sidebar of labeled metadata fields, and a tabbed main content area with body copy and imagery",
  urls: [
    "https://wknd.site/us/en/adventures/bali-surf-camp.html",
    "https://wknd.site/us/en/adventures/beervana-portland.html",
    "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
    "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
    "https://wknd.site/us/en/adventures/cycling-tuscany.html",
    "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
    "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
    "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
    "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
    "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
    "https://wknd.site/us/en/adventures/tahoe-skiing.html",
    "https://wknd.site/us/en/adventures/west-coast-cycling.html",
    "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
  ],
  blocks: [
    {
      "name": "breadcrumbs",
      "instances": [
        ".breadcrumb.cmp-breadcrumb--fixed",
        ".breadcrumb"
      ]
    },
    {
      "name": "carousel",
      "instances": [
        ".carousel.panelcontainer"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".tabs.panelcontainer"
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
