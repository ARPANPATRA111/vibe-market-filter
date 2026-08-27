import { X } from "lucide-react";
import { formatCurrency } from "../services/productsApi.js";

function FilterChip({ label, onRemove }) {
  return (
    <button
      className="filter-chip"
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
    >
      <span>{label}</span>
      <X size={14} strokeWidth={2.4} />
    </button>
  );
}

export function AppliedFilters({
  filters,
  metadata,
  onRemoveCategory,
  onResetPrice,
  onClearRating,
  onClearAll,
}) {
  const bounds = metadata.absolutePriceRange;
  const hasCustomPrice =
    filters.priceRange &&
    (filters.priceRange[0] !== bounds.min || filters.priceRange[1] !== bounds.max);
  const hasFilters =
    filters.categories.length > 0 || hasCustomPrice || filters.minRating != null;

  if (!hasFilters) return null;

  return (
    <div className="applied-filters" aria-label="Applied filters">
      <div className="applied-filters__chips">
        {filters.categories.map((value) => {
          const category = metadata.categories.find((item) => item.value === value);
          return (
            <FilterChip
              key={value}
              label={category?.label ?? value}
              onRemove={() => onRemoveCategory(value)}
            />
          );
        })}
        {hasCustomPrice && (
          <FilterChip
            label={`${formatCurrency(filters.priceRange[0])}–${formatCurrency(filters.priceRange[1])}`}
            onRemove={onResetPrice}
          />
        )}
        {filters.minRating != null && (
          <FilterChip
            label={`${filters.minRating} stars & up`}
            onRemove={onClearRating}
          />
        )}
      </div>
      <button className="clear-all-link" type="button" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
