# WKND — EMA Capstone (Edge Delivery Services)

Migration of the [WKND reference site](https://wknd.site/us/en.html) (`/us/en` locale) to
Adobe Edge Delivery Services. Content is authored in Document Authoring (DA); block code and the
design system ship via Git.

## Environments

- **Preview:** https://main--wknd-ema-capstone--ankitkumar-12.aem.page/us/en
- **Live:** https://main--wknd-ema-capstone--ankitkumar-12.aem.live/us/en
- **Content (DA):** https://da.live/#/ankitkumar-12/wknd-ema-capstone

## Scope

`/us/en` locale only — **26 pages** across **6 templates**. The structure supports adding other
locales later without code changes (blocks and design tokens are locale-agnostic; each locale is a
parallel content tree). See [`docs/site-scope.md`](docs/site-scope.md) for the full inventory.

| Template | Pages | Example |
|----------|-------|---------|
| homepage | 1 | `/us/en` |
| adventures-listing | 1 | `/us/en/adventures` |
| adventure-detail | 16 | `/us/en/adventures/bali-surf-camp` |
| article-detail | 5 | `/us/en/magazine/arctic-surfing` |
| content-landing | 2 | `/us/en/about-us`, `/us/en/magazine` |
| faq-page | 1 | `/us/en/faqs` |

## Blocks

Reused from the boilerplate and restyled to WKND: `header`, `footer`, `hero`, `cards`.
Added for WKND: `carousel`, `tabs`, `accordion`, `quote`, `breadcrumbs`.
Each block folder includes a `README.md` authoring guide and `metadata.json`.

## Design system

WKND tokens live in [`styles/styles.css`](styles/styles.css): Source Sans Pro (body) + Asar serif
(headings), text `#202020`, accent yellow `#ffea00`. CTAs render as yellow uppercase square buttons.

## Content import

The import pipeline that produced the DA content lives under `tools/importer/` (git-tracked but not
served): `page-templates.json` (template + block-selector mappings), `parsers/` (per-block HTML → EDS
table), `transformers/wknd-cleanup.js` (strips site chrome), and `import-<template>.js` orchestrators.
Bundles, URL lists, reports, and imported `content/` are build artifacts and are git-ignored.

## Local development

```sh
npm i
npx -y @adobe/aem-cli up   # serves local code against previewed content at http://localhost:3000
npm run lint               # eslint + stylelint
```

## Documentation

See the [aem.live docs](https://www.aem.live/docs/), especially:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

Project conventions and guardrails: [`AGENTS.md`](AGENTS.md).
