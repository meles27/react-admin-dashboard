import { SaleControllers } from "@/controllers/saleControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import {
  saleItemQuerySchema,
  saleQuerySchema,
} from "@/validationSchema/querySchema/saleQuerySchema";
import { Router } from "express";

const saleRouter = Router().use(
  isAllowedTo([USER_ROLE.ADMIN, USER_ROLE.CASHIER, USER_ROLE.STAFF])
);
/**
 * sales route
 */
const saleControllers = new SaleControllers();
saleRouter.route("").get(validateQuery(saleQuerySchema), saleControllers.list);
/**
 * sale-product route
 */
saleRouter
  .route("/:saleId/sale-items")
  .get(validateQuery(saleItemQuerySchema), saleControllers.listSaleItems);
export default saleRouter;
