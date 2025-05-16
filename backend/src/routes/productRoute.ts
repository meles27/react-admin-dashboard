import { ProductControllers } from "@/controllers/productControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import upload from "@/utils/multerConfig";
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
  .post(
    isAllowedTo(allowedRoles),
    upload.single("hero"),
    productControllers.create
  );
productRouter
  .route("/:productId")
  .get(productControllers.retrieve)
  .put(
    isAllowedTo(allowedRoles),
    upload.single("hero"),
    productControllers.update
  )
  .delete(isAllowedTo(allowedRoles), productControllers.softDestroy);

productRouter
  .route("/:productId/product-variants")
  .get(
    validateQuery(productVariantQuerySchema),
    productControllers.listProductVariant
  )
  .post(
    isAllowedTo(allowedRoles),
    upload.single("icon"),
    productControllers.createProductVariant
  );
// .post(
//   isAllowedTo(allowedRoles),
//   upload.array("images", Settings.MAX_VARIANT_IMAGES),
//   productControllers.createProductVariant
// );

productRouter
  .use(isAllowedTo(allowedRoles))
  .route("/:productId/product-variants/:productVariantId")
  .put(upload.single("icon"), productControllers.updateProductVariant)
  // .put(
  //   upload.array("images", Settings.MAX_VARIANT_IMAGES),
  //   productControllers.updateProductVariant
  // )
  .delete(productControllers.softDestroyProductVariant);

export default productRouter;
