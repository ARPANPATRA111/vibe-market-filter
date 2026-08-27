<div align="center">

# 🛍️ Vibe Market

**An e-commerce browsing interface with a real-time multi-filter sidebar.**

Filter by category, price range, and star rating simultaneously — results update instantly, with zero submit buttons.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Node](https://img.shields.io/badge/Node-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-14%20passing-brightgreen)](server/test)

</div>

---

## Quick start

```bash
npm install
npm run dev
```

| Service | URL |
| --- | --- |
| Web app | http://localhost:5173 |
| API | http://localhost:4000 |

Vite proxies `/api` → port 4000. No environment variables needed.

---

## How it works

All business logic lives on the server. The client only builds a query string and renders what comes back.

```text
┌─────────────────────┐   GET /api/products?categories=…&minPrice=…   ┌──────────────────────┐
│   React client      │  ──────────────────────────────────────────▶  │   Express API        │
│                     │                                               │                      │
│  • sidebar controls │                                               │  1. validate query   │
│  • grid rendering   │  ◀──────────────────────────────────────────  │  2. FILTER inventory │
│  • debounce/abort   │      { products[], meta{ count, … } }         │  3. SORT the result  │
└─────────────────────┘                                               └──────────────────────┘
```

**The pipeline is filter-first, sort-second** — the master inventory array is never mutated:

```js
const matching = inventory.filter(/* category AND price AND rating */);
return matching.sort(sorters[filters.sort]);   // sorts the copy, not the source
```

---

## Features

**Filtering**
- ✅ Multi-select category checklist (selections are OR-ed together)
- ✅ Dual-point price range slider, keyboard accessible
- ✅ Minimum star rating radios, 1–5 plus "Any"
- ✅ Filter groups are AND-ed; price bounds are inclusive
- ✅ Cleared filters gracefully bypass reduction → full inventory returns

**Interaction**
- ✅ Instant updates on every click and drag — no submit button
- ✅ Empty state with one-click "Reset filters" when nothing matches
- ✅ Sort By dropdown: Featured · Price: Low to High · Top Rated First
- ✅ Removable applied-filter chips + live result count
- ✅ Slider requests debounced (180 ms); in-flight requests aborted

**Polish**
- ✅ Sticky desktop sidebar, slide-in mobile drawer
- ✅ Loading skeletons, retryable errors, image fallbacks
- ✅ Visible focus states and reduced-motion support

---

## API

```http
GET /api/health
GET /api/products
GET /api/products?categories=electronics,footwear&minPrice=100&maxPrice=500&minRating=4&sort=price_asc
```

| Parameter | Accepted values | Default |
| --- | --- | --- |
| `categories` | Comma-separated slugs: `electronics`, `apparel`, `footwear` | all |
| `minPrice` | Non-negative number | no lower bound |
| `maxPrice` | Non-negative number | no upper bound |
| `minRating` | **Integer** 1–5 | any |
| `sort` | `default` · `price_asc` · `rating_desc` | `default` |

**Response**

```jsonc
{
  "products": [ { "id", "name", "category", "price", "rating", "image", "featuredRank" } ],
  "meta": {
    "total": 18,                    // full inventory size
    "count": 9,                     // matches after filtering
    "categories": [ { "value", "label", "count" } ],
    "absolutePriceRange": { "min": 39, "max": 899 },
    "appliedFilters": { /* normalized */ }
  }
}
```

Invalid input returns `400` with a readable message, e.g. `{"error":"minRating must be an integer from 1 to 5."}`

---

## Testing

```bash
npm test        # 14 unit tests — filtering, sorting, validation
npm run build   # production build of the client
npm run check   # both of the above
```

📋 **[Full testing guide → docs/TESTING.md](docs/TESTING.md)** — copy-paste API checks and a step-by-step UI validation checklist.

---

## Project structure

```text
server/                         ← all business logic
  src/
    data/products.js              master inventory (18 items) + category labels
    services/catalogService.js    ★ filter + sort pipeline, metadata
    utils/parseProductQuery.js    validation & normalization
    routes/products.js            HTTP contract
    app.js · server.js            Express wiring
  test/                           14 tests
client/                         ← presentation only
  src/
    components/                   Sidebar · PriceRange · Grid · Card · Chips · Header
    hooks/useDebouncedValue.js    slider request debounce
    services/productsApi.js       query building + fetch
    App.jsx                       state & data flow
    styles.css                    design system
docs/
  IMPLEMENTATION_PLAN.md          architecture & design record
  TESTING.md                      validation guide
```

---

## Tech stack

**Client** React 18 · Vite 6 · Lucide icons · self-hosted Inter · plain CSS
**Server** Node.js 20 · Express 4 · ES modules
**Tests** Node's built-in test runner (zero test dependencies)
**Data** In-memory server-side array — no database or BaaS needed for this scope

---

<div align="center">
<sub>Product photography from Unsplash · local SVG placeholder on load failure</sub>
</div>
