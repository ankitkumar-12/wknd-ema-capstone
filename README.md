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

## Query index & index-driven listings

The site is **index-driven**: the home "Recent Articles"/"Next Adventures" rails, the `/magazine`
listing, and the `/adventures` listing all render from the live query index (`/query-index.json`)
via the [`cards`](blocks/cards/README.md) block — not from authored links. The header search reads
the same index. Publishing a new page under `/us/en/` makes it appear in the matching listing
automatically, with no code change and no edit to any other page.

`/query-index.json` is the **single source of truth**. The index definition lives in
[`helix-query.yaml`](helix-query.yaml): a `query-index` over `/us/en/**` exposing `title`,
`description`, `image` (og:image), `category` (page metadata) and `lastModified`.

### Registering the query index (one-time, site-admin)

On tools.aem.live-managed sites the repo `helix-query.yaml` is the source-of-truth definition, but
the index must also be **registered once** in the site config for `/query-index.json` to be
generated:

1. Open the site config for `ankitkumar-12/wknd-ema-capstone` at
   [tools.aem.live](https://tools.aem.live) → **Configuration → Indices**.
2. Register a **`query-index`** matching [`helix-query.yaml`](helix-query.yaml): scope `/us/en/**`,
   properties `title`, `description`, `image`, `category`, `lastModified`, target
   `/query-index.json`. **All five properties must be registered** — `category` in particular drives
   the `/adventures` category tabs.
3. Save, then reindex — bulk **Index** over `/us/en` in the tools UI, or via the admin API
   (`POST https://admin.hlx.page/index/ankitkumar-12/wknd-ema-capstone/main/*`). New/updated pages
   are indexed automatically on publish thereafter.

Category comes from each page's `Category` metadata (stamped at import by
`tools/importer/category-map.js`; authors maintain it in DA afterwards).

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
