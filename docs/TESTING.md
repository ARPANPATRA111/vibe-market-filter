# Testing & Validation Guide

Everything below has been run against this codebase. Expected outputs are the **actual** observed results.

---

## 1. Automated tests

```bash
npm test
```

<details>
<summary><b>Expected: 14 passing</b></summary>

```
✔ returns the complete inventory when all filters are empty
✔ matches any selected category but intersects different filter groups
✔ treats minimum and maximum price boundaries as inclusive
✔ minimum rating includes products exactly on the boundary
✔ returns an empty array when no product satisfies every criterion
✔ sorts only the filtered result by ascending price
✔ sorts by rating descending with a deterministic tie-breaker
✔ does not mutate the master inventory
✔ normalizes an empty query into graceful null filters
✔ parses and deduplicates categories and numeric values
✔ rejects unknown category
✔ rejects inverted price range
✔ rejects invalid minimum rating
✔ rejects unsupported sorting
ℹ pass 14   ℹ fail 0
```

</details>

```bash
npm run build     # must finish with "✓ built in …"
npm run check     # tests + build in one shot
```

---

## 2. API validation

Start the API alone:

```bash
npm run start -w server      # http://localhost:4000
```

### 2.1 Baseline

| # | Command | Expected |
| --- | --- | --- |
| T1 | `curl -s localhost:4000/api/health` | `{"status":"ok"}` |
| T2 | `curl -s "localhost:4000/api/products"` | `meta.count` = **18**, `absolutePriceRange` = 39–899 |

> **T2 proves graceful null handling** — no filters supplied, full inventory returned.

### 2.2 Each filter in isolation

```bash
# Category — OR within the group
curl -s "localhost:4000/api/products?categories=electronics,footwear"
# → 12 items, only electronics + footwear

# Price — inclusive on both bounds
curl -s "localhost:4000/api/products?minPrice=39&maxPrice=149"
# → 13 items, cheapest exactly 39, dearest exactly 149

# Rating — "meets or exceeds"
curl -s "localhost:4000/api/products?minRating=4"
# → 16 items, lowest rating 4.1
```

### 2.3 Combinatorial intersection (the core requirement)

```bash
curl -s "localhost:4000/api/products?categories=electronics&minPrice=100&maxPrice=800&minRating=4"
```

Expected — **4 items**, every one satisfying all three criteria at once:

| Product | Price | Rating |
| --- | --- | --- |
| Aero Wireless Headphones | $149 | 4.8 |
| Orbit Smart Watch | $219 | 4.6 |
| Frame Mirrorless Camera | $749 | 4.7 |
| Slate Mechanical Keyboard | $119 | 4.4 |

### 2.4 Zero results

```bash
curl -s "localhost:4000/api/products?categories=apparel&minPrice=800&minRating=5"
# → {"products":[], "meta":{"count":0, …}}
```

### 2.5 Sorting — and proof that filter runs first

```bash
curl -s "localhost:4000/api/products?sort=price_asc"
# → ascending: 39, 49, 69, 84, 89 …

curl -s "localhost:4000/api/products?sort=rating_desc"
# → descending: 4.9, 4.9, 4.8, 4.8, 4.7 …

curl -s "localhost:4000/api/products?categories=footwear&sort=price_asc"
# → 6 footwear only, ordered 49, 99, 109, 124, 139, 169
```

The last one is the key check: **sorting is applied to the already-filtered subset**, not the whole catalogue.

**No-mutation check** — run a sorted request, then an unsorted one:

```bash
curl -s "localhost:4000/api/products?sort=price_asc" > /dev/null
curl -s "localhost:4000/api/products"
# → default order unchanged (featuredRank 1,2,3,4 …), master array untouched
```

### 2.6 Validation / error handling

| Query | Expected |
| --- | --- |
| `?categories=bogus` | `400` `Unsupported category: bogus.` |
| `?minRating=9` | `400` `minRating must be an integer from 1 to 5.` |
| `?minRating=0` | `400` `minRating must be an integer from 1 to 5.` |
| `?minRating=4.5` | `400` `minRating must be an integer from 1 to 5.` |
| `?minPrice=500&maxPrice=10` | `400` `minPrice cannot be greater than maxPrice.` |
| `?minPrice=-5` | `400` `minPrice cannot be negative.` |
| `?minPrice=abc` | `400` `minPrice must be a valid number.` |
| `?sort=random` | `400` `Unsupported sort value: random.` |
| `/api/nope` | `404` `Route not found.` |

Run the whole matrix at once:

```bash
for q in "categories=bogus" "minRating=9" "minRating=0" "minRating=4.5" \
         "minPrice=500&maxPrice=10" "minPrice=-5" "minPrice=abc" "sort=random"; do
  printf "%-28s -> " "$q"
  curl -s -w " [%{http_code}]" "localhost:4000/api/products?$q"; echo
done
```

---

## 3. UI validation checklist

```bash
npm run dev      # then open http://localhost:5173
```

| # | Action | Expected result |
| --- | --- | --- |
| U1 | Load the page | 18 cards, each with image, name, price, star rating. Count reads "18 products" |
| U2 | Tick **Electronics** | Grid updates **instantly**, no submit button. Count drops to 6 |
| U3 | Also tick **Footwear** | Count rises to 12 — categories are OR-ed |
| U4 | Drag the price slider's **left** handle right | Cheap items disappear as you drag; labels track live |
| U5 | Drag handles toward each other | Handles cannot cross |
| U6 | Pick **4 ★ & up** | Only cards showing ≥ 4.0 remain |
| U7 | Combine all three filters | Every visible card satisfies category **and** price **and** rating |
| U8 | Select **5 stars** with no other filters | **0 matches** → grid disappears, empty state appears |
| U9 | Click **Reset filters** in the empty state | Full 18-item catalogue returns, all controls cleared |
| U10 | Sort → **Price: Low to High** | Cards reorder ascending; the filtered set stays the same size |
| U11 | Sort → **Top Rated First** | Cards reorder by rating descending |
| U12 | Apply filters, *then* change sort | Sort reorders only the filtered items — nothing filtered-out reappears |
| U13 | Click an applied-filter **chip's ✕** | Just that one filter is removed, grid updates |
| U14 | Click **Clear all** | Everything resets |
| U15 | Scroll the product grid | Sidebar stays sticky in view |
| U16 | Narrow the window to mobile width | Sidebar collapses; **Filters** button opens a drawer |
| U17 | Tab through the sidebar | Every control reachable with a visible focus ring |
| U18 | Stop the API, then click a filter | Inline error banner with a working **Retry** button |

> **U8 tip:** no product in the dataset is rated 5.0 (max is 4.9), so "5 stars" alone is the fastest way to trigger the empty state.

---

## 4. Verifying logic really is server-side

1. Open **DevTools → Network**, filter to `products`.
2. Change any sidebar control.
3. A fresh `GET /api/products?…` fires, and the JSON response already contains the **filtered and sorted** array.

No filtering or sorting happens in the browser — the client renders `payload.products` in the order received.

Also note in the Network tab:
- Dragging the slider fires **one** request after you settle, not one per pixel (180 ms debounce).
- Rapid changes show earlier requests **cancelled**, preventing out-of-order results.
