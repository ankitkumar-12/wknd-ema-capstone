# WKND Migration Scope — `/us/en`

**Source site:** https://wknd.site (entry point `https://wknd.site/us/en.html`)
**Target EDS site:** `ankitkumar-12/wknd-ema-capstone`
**Content destination:** Document Authoring (`content.da.live/ankitkumar-12/wknd-ema-capstone/`)
**Code destination:** Git via PR (never committed to `main` directly)
**Scope date:** 2026-09-14
**Locale in scope:** `/us/en` only (English, US)

---

## Locale Decision

The full crawl of wknd.site discovered **10 locales**. Only `/us/en` is in scope for this
migration. The others are intentionally **excluded**:

| Locale | Status |
|--------|--------|
| `us/en` | ✅ **In scope** (this migration) |
| `ca/en`, `ca/fr`, `ch/de`, `ch/fr`, `ch/it`, `de/de`, `es/es`, `fr/fr`, `it/it`, `us/es` | ⛔ Out of scope |

**Multi-locale readiness:** The migration is structured so additional locales can be added
later without rework. Each locale is a parallel content tree that reuses the **same block code
and design system** — only the authored content differs. To add a locale later:

1. Re-run URL discovery scoped to the new locale path (e.g. `/ca/en`).
2. Re-use the existing templates and blocks (below) — no code changes expected for
   like-for-like pages.
3. Import the locale's content into DA under the matching path (e.g. `/ca/en/...`).

Keep block CSS/JS locale-agnostic (no hard-coded en-US strings in code; text comes from
authored content) so the same blocks serve every locale.

---

## URL Inventory (`/us/en`)

**26 pages**, discovered via **crawl** (no sitemap or robots.txt exists on wknd.site — expected
for this AEM demo; the crawler fallback was used and confirmed reachable at HTTP 200).

| Group | Count | Pages |
|-------|-------|-------|
| Home (locale root) | 1 | `/us/en.html` |
| Top-level content | 3 | `/us/en/about-us.html`, `/us/en/faqs.html`, `/us/en/magazine.html` |
| Adventures listing | 1 | `/us/en/adventures.html` |
| Adventure details | 16 | `/us/en/adventures/{bali-surf-camp, beervana-portland, climbing-new-zealand, colorado-rock-climbing, cycling-southern-utah, cycling-tuscany, downhill-skiing-wyoming, gastronomic-marais-tour, napa-wine-tasting, riverside-camping-australia, ski-touring-mont-blanc, surf-camp-costa-rica, tahoe-skiing, west-coast-cycling, whistler-mountain-biking, yosemite-backpacking}.html` |
| Magazine articles | 5 | `/us/en/magazine/{arctic-surfing, guide-la-skateparks, san-diego-surf, ski-touring, western-australia}.html` |

**Documents (not migrated as pages):** one shared PDF referenced from the LA Skateparks
article — `/content/dam/wknd-shared/en/magazine/la-skateparks/ultimateguidetolaskateparks.pdf`.
It lives under `wknd-shared` (locale-neutral); handle as an asset link during content import.

**Members-only pages:** The `/magazine/members-only/*` articles (Alaskan Adventure, Fly Fishing
the Amazon) appear on the `ca/en` tree but returned no crawlable `/us/en` URL (gated behind
sign-in). **Decision (confirmed): out of scope** — excluded from this migration.

---

## Page Templates (6)

Template discovery grouped the 26 pages into **6 structural templates**. Names describe
**layout**, not content.

| Template | Pages | Representative URL | Structure |
|----------|-------|--------------------|-----------|
| **homepage** | 1 | `/us/en.html` | Carousel hero → featured-article split panel → "Recent Articles" card grid → secondary feature banner → "Next Adventures" card grid |
| **adventures-listing** | 1 | `/us/en/adventures.html` | Page title → hero image with overlaid text panel → filter tabs → teaser card grid |
| **adventure-detail** | 16 | `/us/en/adventures/bali-surf-camp.html` | Breadcrumbs → carousel hero → left metadata sidebar (activity, trip length, group size, difficulty, price…) → tabbed body (Overview / Itinerary / What to Bring) |
| **article-detail** | 5 | `/us/en/magazine/arctic-surfing.html` | Hero image → title + byline → prose body with inline images & pull-quotes → related-links sidebar |
| **content-landing** | 2 | `/us/en/magazine.html`, `/us/en/about-us.html` | Page title → repeated heading-plus-card-grid sections (featured item + article/contributor grids) |
| **faq-page** | 1 | `/us/en/faqs.html` | Page title → large image → intro copy → accordion of Q&A → "Need more help?" contact sidebar |

Machine-readable template map: `tools/importer/page-templates.json`.
Per-page skeleton cache: `migration-work/visual-trees.json`.
Full catalog + screenshots: `catalog/`.

---

## Block Inventory

**101 block instances → 30 unique variants.** Base block types observed and how they map to the
EDS project's block palette.

### Blocks already in the repo (reuse)
`blocks/`: `cards`, `columns`, `footer`, `fragment`, `header`, `hero`, `widget`.

| Source base block | Variants | Used on | Repo status | Notes |
|-------------------|----------|---------|-------------|-------|
| **hero** | 4 | homepage, adventures-listing, article-detail, content-landing, faq-page | ✅ `hero` exists | Verify variants: image-only, image+overlay text panel, title-bar. Style per WKND. |
| **cards** | 2 | homepage, content-landing | ✅ `cards` exists | Article/contributor/teaser grids. Verify variant coverage. |
| **header** | 1 (global) | all | ✅ `header` exists | WKND top nav (logo, MAGAZINE/ADVENTURES/FAQS/ABOUT US, search, sign-in, locale). High-fidelity migration in Phase 1. |
| **footer** | 1 (global) | all | ✅ `footer` exists | Dark footer (logo, nav links, follow-us social, copyright/disclaimer). |

### Blocks to add / build (not in repo yet)
| Source base block | Variants | Used on | Action |
|-------------------|----------|---------|--------|
| **carousel** | 4 | homepage, adventure-detail | New block. Adventure/home image carousel with caption panel + prev/next + dots. |
| **tabs** | 7 | adventure-detail, adventures-listing | New block. Tabbed content (Overview/Itinerary/What to Bring) and listing filter tabs. |
| **accordion** | 1 | faq-page | New block. Expandable Q&A list. |
| **quote** | 2 | article-detail | New block. Pull-quote / blockquote styling. |
| **breadcrumbs** | 1 | adventure-detail (16), article-detail (5) | New block (or auto-block). Path trail e.g. ADVENTURES ▸ BALI SURF CAMP. |

### "unknown" variants (7) — need modeling
7 variants classified as `unknown` (used on homepage, article-detail, content-landing). These are
default-content compositions (heading + image + paragraph + CTAs) that likely map to **default
content sections** or the **columns** block rather than a custom block. To resolve during
Phase 2 authoring analysis:

- `1 heading + 1 image + 3 ctas + 1 paragraph` (5 pages) — likely article intro / feature block
- `1 heading + 1 image` (4 pages), `1 image` (4 pages) — likely default content (image + text)
- `1 heading + 1 image + 1 paragraph` (2 pages), `1 cta` (1), `2 headings + 1 image + 3 ctas` (1),
  `1 heading + 4 images + 1 cta + 1 list` (1)

**Decision (confirmed):** treat these as **default content / `columns` first**; only promote to a
custom block if Phase 2 authoring analysis shows a repeated structured pattern.

---

## Design System

WKND's visual language to capture as global tokens in Phase 1 (`styles/styles.css`):

- **Brand accent:** WKND yellow (`#FFC72C`-ish) used for active nav, CTAs, section underlines.
- **Typography:** serif display headings (titles like "About Us", "Bali Surf Camp") + sans-serif
  body/labels (uppercase tracking on labels and nav).
- **Header:** white bar, black wordmark "WKND", right-aligned nav, active item highlighted yellow,
  search box, sign-in + locale flag.
- **Footer:** near-black background, white wordmark, inline nav, "FOLLOW US" social icons,
  copyright + disclaimer paragraph.
- **Buttons:** solid yellow with black uppercase label; also light-grey secondary buttons.

High-fidelity target: per-block computed styles extracted from the source and visually verified
against the original.

---

## Migration Plan Reference

This scope feeds the phased plan:

- **Phase 1 — Design system:** global tokens, header, footer (high-fidelity).
- **Phase 2 — Blocks (code → PR):** reuse `hero`/`cards`; build `carousel`, `tabs`, `accordion`,
  `quote`, `breadcrumbs`; resolve the 7 `unknown` variants. Lint + Playwright test before PR.
  Every PR carries a `{branch}--wknd-ema-capstone--ankitkumar-12.aem.page/{path}` preview link.
- **Phase 3 — Content import (content → DA):** parsers + transformers per template; bundled import
  script + `run-bulk-import.js`; publish to DA. (No hand-written HTML into `content/`.)
- **Phase 4 — Validation:** content-completeness scoring + visual critique vs. original; fix & re-verify.

---

## Notes & Risks

- **No sitemap/robots.txt** on wknd.site — crawl fallback used (this is normal for the AEM WKND
  demo). The single logged "error" in the catalog run is just "No sitemap found".
- **Commerce plugin not enabled** (per project decision): adventure pages are treated as standard
  content pages, not products.
- **Members-only content** is sign-in gated and excluded.
- **Shared assets** (`wknd-shared` PDF, Adobe Stock imagery) are locale-neutral; wire as asset
  references during import.
