import assert from "node:assert/strict";
import test from "node:test";
import {
  parseProductQuery,
  QueryValidationError,
} from "../src/utils/parseProductQuery.js";

const allowedCategories = ["electronics", "apparel", "footwear"];

test("normalizes an empty query into graceful null filters", () => {
  assert.deepEqual(parseProductQuery({}, allowedCategories), {
    categories: [],
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sort: "default",
  });
});

test("parses and deduplicates categories and numeric values", () => {
  assert.deepEqual(
    parseProductQuery(
      {
        categories: "electronics,apparel,electronics",
        minPrice: "50",
        maxPrice: "250",
        minRating: "4",
        sort: "rating_desc",
      },
      allowedCategories,
    ),
    {
      categories: ["electronics", "apparel"],
      minPrice: 50,
      maxPrice: 250,
      minRating: 4,
      sort: "rating_desc",
    },
  );
});

for (const [name, query] of [
  ["unknown category", { categories: "books" }],
  ["inverted price range", { minPrice: "200", maxPrice: "100" }],
  ["invalid minimum rating", { minRating: "4.5" }],
  ["unsupported sorting", { sort: "name_desc" }],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(
      () => parseProductQuery(query, allowedCategories),
      QueryValidationError,
    );
  });
}
