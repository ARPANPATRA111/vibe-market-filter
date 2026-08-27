export class QueryValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "QueryValidationError";
  }
}

function singleValue(value, fieldName) {
  if (Array.isArray(value)) {
    throw new QueryValidationError(`${fieldName} must be provided only once.`);
  }
  return value;
}

function optionalNumber(value, fieldName) {
  if (value == null || value === "") return null;
  const normalized = singleValue(value, fieldName);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new QueryValidationError(`${fieldName} must be a valid number.`);
  }

  return parsed;
}

export function parseProductQuery(query, allowedCategories) {
  const rawCategories = singleValue(query.categories, "categories");
  const categories = rawCategories
    ? [...new Set(rawCategories.split(",").map((value) => value.trim()).filter(Boolean))]
    : [];

  const unknownCategory = categories.find(
    (category) => !allowedCategories.includes(category),
  );
  if (unknownCategory) {
    throw new QueryValidationError(`Unsupported category: ${unknownCategory}.`);
  }

  const minPrice = optionalNumber(query.minPrice, "minPrice");
  const maxPrice = optionalNumber(query.maxPrice, "maxPrice");
  const minRating = optionalNumber(query.minRating, "minRating");
  const sort = singleValue(query.sort, "sort") || "default";

  if (minPrice != null && minPrice < 0) {
    throw new QueryValidationError("minPrice cannot be negative.");
  }
  if (maxPrice != null && maxPrice < 0) {
    throw new QueryValidationError("maxPrice cannot be negative.");
  }
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    throw new QueryValidationError("minPrice cannot be greater than maxPrice.");
  }
  if (minRating != null && (!Number.isInteger(minRating) || minRating < 1 || minRating > 5)) {
    throw new QueryValidationError("minRating must be an integer from 1 to 5.");
  }
  if (!["default", "price_asc", "rating_desc"].includes(sort)) {
    throw new QueryValidationError(`Unsupported sort value: ${sort}.`);
  }

  return { categories, minPrice, maxPrice, minRating, sort };
}
