import express from "express";
import { productsRouter } from "./routes/products.js";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/products", productsRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found." });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "An unexpected server error occurred." });
});
