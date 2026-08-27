import { Star } from "lucide-react";
import { formatCurrency } from "../services/productsApi.js";

export function ProductCard({ product, priority = false }) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/product-placeholder.svg";
          }}
        />
        {product.rating >= 4.8 && <span className="product-badge">Top pick</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3>{product.name}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">{formatCurrency(product.price)}</span>
          <span
            className="product-card__rating"
            aria-label={`${product.rating} out of 5 stars`}
          >
            <Star size={15} fill="currentColor" aria-hidden="true" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}
