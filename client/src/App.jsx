import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppliedFilters } from "./components/AppliedFilters.jsx";
import { FilterSidebar } from "./components/FilterSidebar.jsx";
import { ProductGrid, SkeletonGrid } from "./components/ProductGrid.jsx";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { useDebouncedValue } from "./hooks/useDebouncedValue.js";
import { fetchProducts } from "./services/productsApi.js";

const initialFilters = {
  categories: [],
  priceRange: null,
  minRating: null,
  sort: "default",
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [initialRetry, setInitialRetry] = useState(0);
  const [updateRetry, setUpdateRetry] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const debouncedPriceRange = useDebouncedValue(filters.priceRange, 180);

  useEffect(() => {
    const controller = new AbortController();
    setInitialLoading(true);
    setError("");

    fetchProducts(null, controller.signal)
      .then((payload) => {
        setProducts(payload.products);
        setMetadata(payload.meta);
        setFilters((current) => ({
          ...current,
          priceRange: [
            payload.meta.absolutePriceRange.min,
            payload.meta.absolutePriceRange.max,
          ],
        }));
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setInitialLoading(false);
      });

    return () => controller.abort();
  }, [initialRetry]);

  const categoriesKey = filters.categories.join(",");

  useEffect(() => {
    if (!metadata || !hasInteracted || !debouncedPriceRange) return undefined;

    const controller = new AbortController();
    setUpdating(true);
    setError("");

    fetchProducts(
      { ...filters, priceRange: debouncedPriceRange },
      controller.signal,
    )
      .then((payload) => {
        setProducts(payload.products);
        setMetadata(payload.meta);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setUpdating(false);
      });

    return () => controller.abort();
  }, [
    categoriesKey,
    debouncedPriceRange?.[0],
    debouncedPriceRange?.[1],
    filters.minRating,
    filters.sort,
    metadata?.absolutePriceRange.min,
    hasInteracted,
    updateRetry,
  ]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const hasActiveFilters = useMemo(() => {
    if (!metadata || !filters.priceRange) return false;
    const bounds = metadata.absolutePriceRange;
    return (
      filters.categories.length > 0 ||
      filters.priceRange[0] !== bounds.min ||
      filters.priceRange[1] !== bounds.max ||
      filters.minRating != null
    );
  }, [filters, metadata]);

  function updateFilters(updater) {
    setFilters(updater);
    setHasInteracted(true);
  }

  function toggleCategory(category) {
    updateFilters((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((value) => value !== category)
        : [...current.categories, category],
    }));
  }

  function resetFilters() {
    if (!metadata) return;
    setFilters({
      categories: [],
      priceRange: [metadata.absolutePriceRange.min, metadata.absolutePriceRange.max],
      minRating: null,
      sort: "default",
    });
    setHasInteracted(true);
    setMobileFiltersOpen(false);
  }

  if (initialLoading) {
    return (
      <>
        <SiteHeader />
        <main className="page-shell loading-shell">
          <div className="hero-placeholder skeleton" />
          <SkeletonGrid />
        </main>
      </>
    );
  }

  if (!metadata) {
    return (
      <>
        <SiteHeader />
        <main className="fatal-state">
          <AlertCircle size={32} aria-hidden="true" />
          <h1>We couldn’t load the marketplace</h1>
          <p>{error || "Please check that the API server is running."}</p>
          <button className="primary-button" onClick={() => setInitialRetry((value) => value + 1)}>
            Try again
          </button>
        </main>
      </>
    );
  }

  return (
    <div id="top">
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero__glow" aria-hidden="true" />
          <div className="page-shell hero__inner">
            <p className="eyebrow hero__eyebrow">
              <Sparkles size={14} fill="currentColor" /> CURATED MARKETPLACE
            </p>
            <h1>Find the right product, faster.</h1>
            <p className="hero__copy">
              Explore a thoughtfully selected collection across technology, style, and footwear.
            </p>
          </div>
        </section>

        <div className="page-shell catalog-layout">
          <button
            className={`filter-overlay ${mobileFiltersOpen ? "filter-overlay--open" : ""}`}
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
            tabIndex={mobileFiltersOpen ? 0 : -1}
          />
          <FilterSidebar
            categories={metadata.categories}
            filters={filters}
            priceBounds={metadata.absolutePriceRange}
            onToggleCategory={toggleCategory}
            onPriceChange={(priceRange) =>
              updateFilters((current) => ({ ...current, priceRange }))
            }
            onRatingChange={(minRating) =>
              updateFilters((current) => ({ ...current, minRating }))
            }
            onReset={resetFilters}
            isResetDisabled={!hasActiveFilters && filters.sort === "default"}
            isMobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          <section className="catalog" aria-label="Product catalogue">
            <div className="catalog-toolbar">
              <div>
                <p className="eyebrow">SHOP THE COLLECTION</p>
                <p className="result-count" aria-live="polite">
                  <strong>{products.length}</strong> {products.length === 1 ? "product" : "products"}
                </p>
              </div>
              <div className="toolbar-actions">
                <button
                  className="mobile-filter-button"
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal size={17} />
                  Filters{hasActiveFilters ? " •" : ""}
                </button>
                <label className="sort-control">
                  <span>Sort by</span>
                  <select
                    value={filters.sort}
                    onChange={(event) =>
                      updateFilters((current) => ({ ...current, sort: event.target.value }))
                    }
                    aria-label="Sort products"
                  >
                    <option value="default">Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="rating_desc">Top Rated First</option>
                  </select>
                  <ChevronDown className="sort-control__chevron" size={16} aria-hidden="true" />
                  <ArrowUpDown className="sort-control__mobile-icon" size={17} aria-hidden="true" />
                </label>
              </div>
            </div>

            <AppliedFilters
              filters={filters}
              metadata={metadata}
              onRemoveCategory={toggleCategory}
              onResetPrice={() =>
                updateFilters((current) => ({
                  ...current,
                  priceRange: [
                    metadata.absolutePriceRange.min,
                    metadata.absolutePriceRange.max,
                  ],
                }))
              }
              onClearRating={() =>
                updateFilters((current) => ({ ...current, minRating: null }))
              }
              onClearAll={resetFilters}
            />

            {error && (
              <div className="error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
                <button type="button" onClick={() => setUpdateRetry((value) => value + 1)}>
                  Retry
                </button>
              </div>
            )}

            <div className={`catalog-results ${updating ? "catalog-results--updating" : ""}`}>
              {updating && <span className="updating-indicator">Updating products…</span>}
              <ProductGrid products={products} onReset={resetFilters} />
            </div>
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <div className="page-shell">
          <span>VIBE MARKET</span>
          <span>Designed for effortless discovery.</span>
        </div>
      </footer>
    </div>
  );
}
