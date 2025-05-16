import { ProductVariantControllers } from "@/controllers/productVariantControllers";
import { validateQuery } from "@/middleware/validateQuery";
import { productVariantQuerySchema } from "@/validationSchema/querySchema/productQuerySchema";
import { Router } from "express";

const productVariantRouter = Router();

const productVariantControlllers = new ProductVariantControllers();

productVariantRouter
  .route("")
  .get(
    validateQuery(productVariantQuerySchema),
    productVariantControlllers.list
  );

export default productVariantRouter;
