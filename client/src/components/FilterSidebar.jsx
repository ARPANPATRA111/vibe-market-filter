import { RotateCcw, Star, X } from "lucide-react";
import { PriceRangeFilter } from "./PriceRangeFilter.jsx";

export function FilterSidebar({
  categories,
  filters,
  priceBounds,
  onToggleCategory,
  onPriceChange,
  onRatingChange,
  onReset,
  isResetDisabled,
  isMobileOpen,
  onMobileClose,
}) {
  return (
    <aside
      className={`filter-panel ${isMobileOpen ? "filter-panel--open" : ""}`}
      aria-label="Product filters"
    >
      <div className="filter-panel__header">
        <div>
          <p className="eyebrow">REFINE RESULTS</p>
          <h2>Filters</h2>
        </div>
        <button
          className="icon-button filter-panel__close"
          type="button"
          onClick={onMobileClose}
          aria-label="Close filters"
        >
          <X size={20} />
        </button>
      </div>

      <section className="filter-section" aria-labelledby="category-heading">
        <h3 id="category-heading">Category</h3>
        <div className="filter-options">
          {categories.map((category) => (
            <label className="check-option" key={category.value}>
              <span className="check-option__control">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => onToggleCategory(category.value)}
                />
                <span className="custom-checkbox" aria-hidden="true" />
              </span>
              <span>{category.label}</span>
              <span className="option-count">{category.count}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="filter-section" aria-labelledby="price-heading">
        <h3 id="price-heading">Price range</h3>
        <PriceRangeFilter
          min={priceBounds.min}
          max={priceBounds.max}
          values={filters.priceRange}
          onChange={onPriceChange}
        />
      </section>

      <section className="filter-section" aria-labelledby="rating-heading">
        <h3 id="rating-heading">Minimum rating</h3>
        <div className="filter-options rating-options">
          <label className="radio-option">
            <input
              type="radio"
              name="minimum-rating"
              checked={filters.minRating == null}
              onChange={() => onRatingChange(null)}
            />
            <span className="custom-radio" aria-hidden="true" />
            <span>Any rating</span>
          </label>
          {[5, 4, 3, 2, 1].map((rating) => (
            <label className="radio-option" key={rating}>
              <input
                type="radio"
                name="minimum-rating"
                checked={filters.minRating === rating}
                onChange={() => onRatingChange(rating)}
              />
              <span className="custom-radio" aria-hidden="true" />
              <span className="rating-label">
                <Star size={16} fill="currentColor" aria-hidden="true" />
                <span>{rating}</span>
                <span className="rating-suffix">{rating < 5 ? "& up" : "stars"}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <button
        className="reset-button"
        type="button"
        onClick={onReset}
        disabled={isResetDisabled}
      >
        <RotateCcw size={16} />
        Reset all filters
      </button>
    </aside>
  );
}
