# Vibe Market

E-commerce product browsing interface with a multi-filter sidebar: category checklist, dual-point price range slider, and minimum star rating - all applied together and reflected in the grid instantly, with no submit button.

The React client handles presentation and interaction only. The Express server owns the master inventory, query validation, combinatorial filtering, sorting, result counts, and catalogue metadata.

```text
React client  --GET /api/products?categories&minPrice&maxPrice&minRating&sort-->  Express API
              <--------------  matching products + catalogue metadata  ---------
```

## Features

- Multiple category selection
- Native, keyboard-accessible dual price range control
- Minimum star rating radio controls from 1 to 5
- Server-side intersection filtering
- Server-side price and rating sorting
- Graceful handling of empty filters
- Empty state with a one-click reset
- Applied-filter chips and live result count
- Loading skeletons, non-blocking updates, request cancellation, and retryable errors
- Sticky desktop filter panel and responsive mobile filter drawer
- Premium image-led UI with visible focus states and reduced-motion support

## Requirements coverage

| Requirement | Where it lives |
| --- | --- |
| Sticky sidebar: category checklist, dual price slider, 1-5 star radios | [FilterSidebar.jsx](client/src/components/FilterSidebar.jsx), [PriceRangeFilter.jsx](client/src/components/PriceRangeFilter.jsx) |
| Product grid cards with thumbnail, price, rating, name | [ProductCard.jsx](client/src/components/ProductCard.jsx), [ProductGrid.jsx](client/src/components/ProductGrid.jsx) |
| Instant feedback, no submit button | [App.jsx](client/src/App.jsx) - every control change refetches; slider input is debounced and in-flight requests are aborted |
| Zero-match screen with a "Reset filters" button | [ProductGrid.jsx](client/src/components/ProductGrid.jsx) |
| Combinatorial intersect filtering over the master array | [catalogService.js](server/src/services/catalogService.js) - `filterAndSortProducts` |
| Graceful null handling for cleared filters | [catalogService.js](server/src/services/catalogService.js) + [parseProductQuery.js](server/src/utils/parseProductQuery.js) |
| Sort By dropdown, top right of the grid | [App.jsx](client/src/App.jsx) - `Featured`, `Price: Low to High`, `Top Rated First` |
| Filter first, then sort the remaining set | [catalogService.js](server/src/services/catalogService.js) - filter runs before `sort`, on a copy |
| Business logic on the server | All filtering, sorting, validation, and counts are computed in `server/src` |

## Technology

- Client: React 18, Vite, JavaScript, CSS, Lucide icons, self-hosted Inter font files
- Server: Node.js, Express, JavaScript
- Tests: Node's built-in test runner
- Data: Local server-side product array
- Development: npm workspaces and Concurrently

The project intentionally does not use Supabase, another BaaS, a database, or deployment infrastructure. None is needed for the assessment scope.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

From the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Express API runs at `http://localhost:4000` and Vite proxies `/api` requests to it.

No environment variables are required.

## Verification commands

```bash
npm test
npm run build
npm run check
```

`npm run check` runs all backend tests and then creates the frontend production build.

## API

### Health check

```http
GET /api/health
```

### Product catalogue

```http
GET /api/products
GET /api/products?categories=electronics,footwear&minPrice=100&maxPrice=200&minRating=4&sort=price_asc
```

Supported query parameters:

| Parameter | Accepted values | Default |
| --- | --- | --- |
| `categories` | Comma-separated category slugs | All categories |
| `minPrice` | Non-negative number | No lower bound |
| `maxPrice` | Non-negative number | No upper bound |
| `minRating` | Integer from 1 to 5 | Any rating |
| `sort` | `default`, `price_asc`, `rating_desc` | `default` |

The response contains the matching products plus the total count, result count, category metadata, absolute price range, and normalized applied filters. Invalid parameters return HTTP `400` with a readable error message.

## Filtering rules

- Selected categories are OR-ed with one another.
- Category, price, and rating groups are AND-ed together.
- Price boundaries are inclusive.
- Rating means greater than or equal to the selected minimum.
- Missing filters bypass that criterion.
- The server filters before sorting.
- Sorting is performed on the filtered copy and never mutates the master inventory.

## Project structure

```text
client/
  public/product-placeholder.svg
  src/
    components/               Reusable catalogue and filter UI
    hooks/useDebouncedValue.js Slider request debounce
    services/productsApi.js   Query construction and API client
    App.jsx                   State, data flow, and page composition
    styles.css                Design system and responsive layout
server/
  src/
    data/products.js          Master inventory and category labels
    routes/products.js        HTTP route and response contract
    services/catalogService.js Pure filtering, sorting, and metadata
    utils/parseProductQuery.js Validation and normalization
    app.js                    Express application
    server.js                 Server entry point
  test/                       Business-logic and validation tests
docs/
  IMPLEMENTATION_PLAN.md    Architecture and design record
```

Product photography is loaded from fixed Unsplash URLs. A local SVG placeholder is displayed if an external image cannot load.

## Additional documentation

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md) - architecture, data design, and verification notes
