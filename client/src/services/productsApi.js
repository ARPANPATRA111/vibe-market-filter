export async function fetchProducts(filters, signal) {
  const query = new URLSearchParams();

  if (filters) {
    if (filters.categories.length > 0) {
      query.set("categories", filters.categories.join(","));
    }
    if (filters.priceRange) {
      query.set("minPrice", String(filters.priceRange[0]));
      query.set("maxPrice", String(filters.priceRange[1]));
    }
    if (filters.minRating != null) {
      query.set("minRating", String(filters.minRating));
    }
    if (filters.sort !== "default") {
      query.set("sort", filters.sort);
    }
  }

  const queryString = query.toString();
  const response = await fetch(`/api/products${queryString ? `?${queryString}` : ""}`, {
    signal,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Unable to load the product catalogue.");
  }

  return payload;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
