import { PackageSearch, RotateCcw } from "lucide-react";
import { ProductCard } from "./ProductCard.jsx";

export function ProductGrid({ products, onReset }) {
  if (products.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <span className="empty-state__icon" aria-hidden="true">
          <PackageSearch size={30} />
        </span>
        <p className="eyebrow">ZERO RESULTS</p>
        <h2>No products found</h2>
        <p>Try widening your price range or removing one of the active filters.</p>
        <button className="primary-button" type="button" onClick={onReset}>
          <RotateCcw size={17} />
          Reset filters
        </button>
      </section>
    );
  }

  return (
    <div className="product-grid" aria-live="polite">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 3} />
      ))}
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="product-grid" aria-label="Loading products" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="product-card skeleton-card" key={index}>
          <div className="skeleton skeleton-image" />
          <div className="product-card__body">
            <div className="skeleton skeleton-kicker" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-meta" />
          </div>
        </div>
      ))}
    </div>
  );
}
