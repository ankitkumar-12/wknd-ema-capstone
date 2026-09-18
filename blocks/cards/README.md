# cards

Index-driven **cards** block. Renders a teaser grid (image + title + description)
from the live query index (`/query-index.json`) — not from hardcoded links.
Publishing a new page under the configured path prefix makes it appear
automatically.

## Authoring (Document Authoring)

The block is **empty** apart from a two-column config table:

| Cards    |                                   |
| -------- | --------------------------------- |
| path     | `/us/en/magazine/`                |
| limit    | `4` (optional — omit to show all) |
| category | `Skiing` (optional — filter)      |
| group    | `category` (optional — tabs)      |
| sort     | `lastModified` (optional; default)|

- **path** (required) — only index rows whose `path` starts with this prefix are
  listed (the listing page at that prefix is excluded).
- **limit** — cap the number of cards.
- **category** — keep only rows whose `Category` metadata includes this value
  (multi-value `Category` is comma-separated).
- **group=category** — render category tabs (All + one per distinct category),
  each with its own grid. Used by the `/adventures` listing.
- **sort** — index field to sort by; defaults to `lastModified` descending.

Card fields come from each page's metadata: `title`, `description`, `image`
(og:image) and `category`. Images use `createOptimizedPicture` so they carry
width/height.

## Supported variations

- default — flat responsive grid
- `group=category` — category-tabbed grids

## Universal Editor fields

N/A (Document Authoring project)
