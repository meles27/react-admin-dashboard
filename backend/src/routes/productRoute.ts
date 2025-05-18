import { ProductControllers } from "@/controllers/productControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import {
  productQuerySchema,
  productVariantQuerySchema,
} from "@/validationSchema/querySchema/productQuerySchema";
import { Router } from "express";

const allowedRoles: USER_ROLE[] = [USER_ROLE.ADMIN];

const productRouter = Router();
/**
 * products routes
 */
const productControllers = new ProductControllers();
productRouter
  .route("")
  .get(validateQuery(productQuerySchema), productControllers.list)
  .post(isAllowedTo(allowedRoles), productControllers.create);
productRouter
  .route("/:productId")
  .get(productControllers.retrieve)
  .put(isAllowedTo(allowedRoles), productControllers.update)
  .delete(isAllowedTo(allowedRoles), productControllers.softDestroy);

productRouter
  .route("/:productId/product-variants")
  .get(
    validateQuery(productVariantQuerySchema),
    productControllers.listProductVariant
  )
  .post(isAllowedTo(allowedRoles), productControllers.createProductVariant);

productRouter
  .use(isAllowedTo(allowedRoles))
  .route("/:productId/product-variants/:productVariantId")
  .put(productControllers.updateProductVariant)
  .delete(productControllers.softDestroyProductVariant);

export default productRouter;
