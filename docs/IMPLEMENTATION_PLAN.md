# Vibe Market Implementation Plan and Record

## 1. Objective

Build the core browsing interface of a marketplace in which shoppers can combine category, price, and minimum-rating filters, see the product grid update without a submit action, reset an empty result, and sort the filtered result.

The assessment adds one architectural constraint: business logic, calculations, validation, and computation belong on the server. The implementation therefore does not perform catalogue filtering or sorting in React.

## 2. Confirmed scope

### Required

- Sticky desktop filter sidebar
- Multiple category checkboxes
- Dual-point minimum/maximum price control
- Minimum rating radios from 1 through 5
- Product cards containing image, name, price, and rating
- Instant catalogue refresh
- Combined intersection filtering
- Full inventory when filters are absent
- No-results state with reset action
- Price ascending and top-rated sorting
- Server-side business logic
- Public-repository-ready structure and documentation

### Deliberately excluded

- Database or Supabase
- Authentication
- Cart, checkout, and product detail routes
- Admin tools
- Pagination
- Persistence of filter state
- Deployment configuration

## 3. Technology decision

### Selected stack

- React and Vite for fast UI development
- Node.js and Express for an explicit, easy-to-explain server boundary
- Plain JavaScript to match the candidate's strongest language
- Plain CSS with design tokens to avoid framework setup and generated class noise
- npm workspaces for one repository and one installation command
- Node's test runner to avoid an additional testing framework

### Why no BaaS

The product data is a fixed assessment dataset, and the main backend requirement is a transparent filtering pipeline. Adding Supabase would introduce credentials, network dependency, schema setup, and an abstraction that makes the core algorithm harder to demonstrate in a viva.

## 4. Architecture

```text
React controls
    -> controlled filter state
    -> validated query parameters
    -> GET /api/products
    -> Express query parser
    -> pure filter function over master inventory
    -> sort filtered copy
    -> products + metadata JSON
    -> React renders cards, chips, count, or empty state
```

### Responsibility boundary

Client responsibilities:

- Render controls and product states
- Store current user selections
- Debounce slider requests by 180 ms
- Abort obsolete requests
- Display API results and errors
- Open and close the mobile filter drawer

Server responsibilities:

- Normalize and validate all query input
- Determine catalogue bounds and category counts
- Apply category, price, and rating predicates
- Sort only after filtering
- Return authoritative counts and applied filters
- Reject unsupported or unsafe input

## 5. Data design

The server holds 18 products distributed evenly across Electronics, Apparel, and Footwear. The data deliberately covers:

- Low, medium, and high prices
- Ratings from 3.8 to 4.9
- Exact boundary values used by tests
- Filter combinations with results
- A 5-star selection that produces an empty result

Each product has:

```js
{
  id,
  name,
  category,
  price,
  rating,
  image,
  featuredRank
}
```

`featuredRank` gives the default sort a deterministic order. Product prices and ratings remain numeric throughout the backend.

## 6. Server implementation

### Query parsing

`parseProductQuery` converts URL strings into a normalized filter object. It:

- Converts comma-separated categories into a deduplicated array
- Rejects categories not present in the server allowlist
- Converts price and rating strings into numbers
- Rejects non-finite and negative prices
- Rejects inverted price ranges
- Requires rating to be an integer from 1 to 5
- Restricts sorting to a fixed allowlist
- Maps missing values to `null` or an empty array

### Filtering algorithm

For each product:

```text
(no categories OR category is selected)
AND (no minimum price OR price >= minimum)
AND (no maximum price OR price <= maximum)
AND (no rating OR rating >= minimum rating)
```

Selected categories use OR semantics within the category group. The different filter groups use AND semantics.

### Sorting pipeline

The server first creates a new array with `Array.prototype.filter`, then sorts that filtered array. Available ordering:

- `default`: ascending `featuredRank`
- `price_asc`: ascending price, then alphabetical name
- `rating_desc`: descending rating, then `featuredRank`

The master inventory is never mutated. Complexity is `O(n)` for filtering plus `O(k log k)` for sorting `k` matches.

### API response

The single catalogue endpoint returns:

- Matching products
- Total inventory size
- Matching result count
- Category labels and base counts
- Absolute catalogue price bounds
- Normalized applied filters

This lets the server remain authoritative while avoiding a second metadata endpoint.

## 7. Client implementation

### State

```js
{
  categories: [],
  priceRange: [serverMinimum, serverMaximum],
  minRating: null,
  sort: "default"
}
```

The initial unfiltered request supplies the absolute price range. Later user changes trigger filtered requests.

### Request behaviour

- Checkbox, rating, sort, and reset actions request immediately.
- Price labels and handles move immediately.
- Price API calls are debounced for 180 ms.
- Every effect owns an `AbortController`; newer state cancels an obsolete request.
- Existing products remain visible with reduced opacity during a refresh.
- A failed update retains the previous results and exposes a Retry action.

### Components

- `SiteHeader`: compact brand header
- `FilterSidebar`: categories, price, rating, reset, and mobile close
- `PriceRangeFilter`: two overlapping native range inputs
- `AppliedFilters`: removable selection overview
- `ProductCard`: image, label, name, price, and rating
- `ProductGrid`: cards or the mandatory empty state
- `SkeletonGrid`: shape-matched initial loading state

Native range inputs were selected for the final slider because they provide reliable keyboard semantics and independently focusable minimum and maximum handles without relying on a custom gesture implementation.

## 8. Visual design plan

Direction: a restrained premium U.S. retail aesthetic combining image-led product presentation with clear marketplace controls.

Design tokens:

- Off-white canvas: `#f7f7f5`
- White surfaces: `#ffffff`
- Near-black text: `#171717`
- Cobalt interaction accent: `#2563eb`
- Amber ratings: `#f59e0b`
- Inter typeface, stored in the bundle
- 17-18 px card/panel radii
- Fine neutral borders and low-opacity shadows

Polish features:

- Applied-filter chips
- Live result count
- Top-pick badges
- Image fallback
- Card lift and image scale on hover
- Skeleton loading
- Subtle updating indicator
- Visible keyboard focus
- Reduced-motion media query

Responsive behaviour:

- Three grid columns on large desktop
- Two columns on compact desktop/tablet
- One column on narrow mobile
- Sticky sidebar becomes an off-canvas drawer below 820 px
- Mobile filters and sort become compact toolbar controls
- Applied chips become horizontally scrollable when necessary

## 9. Verification plan

Automated backend coverage:

- Empty filters return all products
- OR within category and AND across groups
- Inclusive price boundaries
- Inclusive minimum-rating boundary
- Zero-result combination
- Price sorting after filtering
- Rating sorting with deterministic ties
- Master array immutability
- Empty query normalization
- Numeric and category parsing
- Rejection of unknown categories, inverted ranges, decimal ratings, and invalid sorts

Build validation:

- Vite production compilation
- npm dependency audit

Runtime validation performed:

- Unfiltered API returns 18 of 18 products
- A combined query returns the expected price-ordered IDs
- Desktop render visually inspected at 1440 px
- Mobile render visually inspected with an exact 390 px emulated viewport
- Both native price handles visually verified
- Electronics checkbox verified end-to-end: result changes to six Electronics cards
- Top Rated First verified end-to-end: the 4.9-rated laptop becomes first

## 10. Recommended assessment implementation order

1. Scaffold client/server workspace.
2. Add representative dataset.
3. Write pure filter/sort service.
4. Add validation and API route.
5. Test business logic.
6. Build base catalogue layout and product cards.
7. Add controlled filter inputs.
8. Connect controls to API.
9. Add sorting, reset, and empty state.
10. Add applied chips, request cancellation, and loading/error states.
11. Polish responsive CSS and accessibility.
12. Run checks, write README, push, and verify the public repository.

## 11. Suggested incremental commits

```text
chore: scaffold React client and Express server
feat(api): add catalogue data and filtering pipeline
test(api): cover filtering validation and sorting
feat(ui): add responsive catalogue and product cards
feat(filters): connect sidebar controls to products API
feat(sort): add server-side catalogue ordering
feat(ui): add empty loading and error states
style: polish responsive marketplace interface
docs: add setup architecture and validation guide
```

## 12. Future extensions

If requirements expand later, the existing API boundary supports:

- Pagination and result windows
- Database-backed inventory
- Category-specific facets
- Search
- URL-synchronized filters
- Server caching
- Product detail and cart flows

Those extensions are intentionally not part of this assessment MVP.
