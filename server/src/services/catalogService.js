const sorters = {
  default: (a, b) => a.featuredRank - b.featuredRank,
  price_asc: (a, b) => a.price - b.price || a.name.localeCompare(b.name),
  rating_desc: (a, b) => b.rating - a.rating || a.featuredRank - b.featuredRank,
};

export function filterAndSortProducts(inventory, filters) {
  const categories = filters.categories ?? [];

  const matchingProducts = inventory.filter((product) => {
    const matchesCategory =
      categories.length === 0 || categories.includes(product.category);
    const matchesMinimumPrice =
      filters.minPrice == null || product.price >= filters.minPrice;
    const matchesMaximumPrice =
      filters.maxPrice == null || product.price <= filters.maxPrice;
    const matchesRating =
      filters.minRating == null || product.rating >= filters.minRating;

    return (
      matchesCategory &&
      matchesMinimumPrice &&
      matchesMaximumPrice &&
      matchesRating
    );
  });

  return matchingProducts.sort(sorters[filters.sort ?? "default"]);
}

export function createCatalogMetadata(inventory, categoryLabels) {
  const prices = inventory.map((product) => product.price);
  const categories = Object.entries(categoryLabels).map(([value, label]) => ({
    value,
    label,
    count: inventory.filter((product) => product.category === value).length,
  }));

  return {
    total: inventory.length,
    categories,
    absolutePriceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
    },
  };
}
