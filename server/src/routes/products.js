import { Router } from "express";
import { categoryLabels, products } from "../data/products.js";
import {
  createCatalogMetadata,
  filterAndSortProducts,
} from "../services/catalogService.js";
import {
  parseProductQuery,
  QueryValidationError,
} from "../utils/parseProductQuery.js";

export const productsRouter = Router();

const baseMetadata = createCatalogMetadata(products, categoryLabels);
const allowedCategories = baseMetadata.categories.map((category) => category.value);

productsRouter.get("/", (request, response, next) => {
  try {
    const filters = parseProductQuery(request.query, allowedCategories);
    const matchingProducts = filterAndSortProducts(products, filters);

    response.json({
      products: matchingProducts,
      meta: {
        ...baseMetadata,
        count: matchingProducts.length,
        appliedFilters: filters,
      },
    });
  } catch (error) {
    if (error instanceof QueryValidationError) {
      response.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});
