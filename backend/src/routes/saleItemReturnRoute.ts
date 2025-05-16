import { SaleItemReturnControllers } from "@/controllers/saleItemReturnControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import { saleItemReturnQuerySchema } from "@/validationSchema/querySchema/saleItemReturnQuerySchema";
import { Router } from "express";

const allowedRoles: USER_ROLE[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.CASHIER,
  USER_ROLE.STAFF,
];
const saleItemReturnRouter = Router().use(isAllowedTo(allowedRoles));
/**
 * sales route
 */
const saleItemReturnControllers = new SaleItemReturnControllers();
saleItemReturnRouter
  .route("")
  .get(validateQuery(saleItemReturnQuerySchema), saleItemReturnControllers.list)
  .post(saleItemReturnControllers.create);

saleItemReturnRouter
  .route("/:saleItemReturnId")
  .delete(saleItemReturnControllers.destroy);
saleItemReturnRouter
  .route("/:saleItemReturnId/confirm-return")
  .post(saleItemReturnControllers.confirmSaleItemReturn);
export default saleItemReturnRouter;
