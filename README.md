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

## Search

The header search box filters pages by **title and description**. It loads its index from the
first source that responds:

1. `/query-index.json` — the EDS-generated live index (preferred).
2. [`us/en/search-index.json`](us/en/search-index.json) — a committed static fallback of the 26
   `/us/en` pages, so search works even before a live index exists.

Search is functional today via the static fallback. **No code change is needed to switch to the
live index** — once `query-index.json` is published, the header prefers it automatically
(`loadSearchIndex()` in [`blocks/header/header.js`](blocks/header/header.js)).

### Enabling the live query index (one-time, site-admin)

`helix-query.yaml` is retired; index definitions live at
[tools.aem.live](https://tools.aem.live), not in the repo. A site admin needs to:

1. Open the site config for `ankitkumar-12/wknd-ema-capstone` at tools.aem.live →
   **Configuration → Indices**.
2. Add a **`query-index`** scoped to `/us/en/**` exposing the `title` and `description`
   properties (the fields the header search reads).
3. Save, then reindex — bulk **Index** over `/us/en` in the tools UI, or trigger it via the admin
   API (`POST https://admin.hlx.page/index/ankitkumar-12/wknd-ema-capstone/main/*`). New/updated
   pages are indexed automatically on publish thereafter.

Once `query-index.json` resolves, the static `us/en/search-index.json` becomes a redundant
fallback and can be removed if desired.

### Refreshing the static index

While the static fallback is in use, regenerate it from the imported content after a re-import:

```sh
node tools/importer/build-search-index.js   # writes us/en/search-index.json
```

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
