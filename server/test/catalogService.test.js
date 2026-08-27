import assert from "node:assert/strict";
import test from "node:test";
import { products } from "../src/data/products.js";
import { filterAndSortProducts } from "../src/services/catalogService.js";

const emptyFilters = {
  categories: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  sort: "default",
};

test("returns the complete inventory when all filters are empty", () => {
  const result = filterAndSortProducts(products, emptyFilters);
  assert.equal(result.length, products.length);
});

test("matches any selected category but intersects different filter groups", () => {
  const result = filterAndSortProducts(products, {
    categories: ["electronics", "footwear"],
    minPrice: 100,
    maxPrice: 200,
    minRating: 4.6,
    sort: "default",
  });

  assert.deepEqual(
    result.map((product) => product.id),
    ["elec-001", "shoe-003", "shoe-005"],
  );
});

test("treats minimum and maximum price boundaries as inclusive", () => {
  const result = filterAndSortProducts(products, {
    ...emptyFilters,
    minPrice: 149,
    maxPrice: 149,
  });
  assert.deepEqual(result.map((product) => product.id), ["elec-001"]);
});

test("minimum rating includes products exactly on the boundary", () => {
  const result = filterAndSortProducts(products, {
    ...emptyFilters,
    categories: ["electronics"],
    minRating: 4.8,
  });
  assert.deepEqual(result.map((product) => product.id), ["elec-001", "elec-003"]);
});

test("returns an empty array when no product satisfies every criterion", () => {
  const result = filterAndSortProducts(products, {
    ...emptyFilters,
    categories: ["electronics"],
    maxPrice: 50,
    minRating: 5,
  });
  assert.deepEqual(result, []);
});

test("sorts only the filtered result by ascending price", () => {
  const result = filterAndSortProducts(products, {
    ...emptyFilters,
    categories: ["apparel"],
    minRating: 4.5,
    sort: "price_asc",
  });
  assert.deepEqual(result.map((product) => product.price), [39, 84, 129, 159]);
});

test("sorts by rating descending with a deterministic tie-breaker", () => {
  const result = filterAndSortProducts(products, {
    ...emptyFilters,
    categories: ["footwear"],
    sort: "rating_desc",
  });
  assert.deepEqual(result.map((product) => product.rating), [4.8, 4.7, 4.6, 4.5, 4.3, 3.8]);
});

test("does not mutate the master inventory", () => {
  const originalOrder = products.map((product) => product.id);
  filterAndSortProducts(products, { ...emptyFilters, sort: "price_asc" });
  assert.deepEqual(products.map((product) => product.id), originalOrder);
});
