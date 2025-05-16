import { SaleOrderControllers } from "@/controllers/order/saleOrderControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import {
  saleOrderItemQuerySchema,
  saleOrderQuerySchema,
} from "@/validationSchema/querySchema/order/saleOrderQuerySchema";
import { Router } from "express";

const saleOrderControllers = new SaleOrderControllers();

const allowedRoles: USER_ROLE[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.CASHIER,
  USER_ROLE.STAFF,
];
const saleOrderRouter = Router().use(isAllowedTo(allowedRoles));

saleOrderRouter
  .route("")
  .get(validateQuery(saleOrderQuerySchema), saleOrderControllers.list)
  .post(saleOrderControllers.create);

saleOrderRouter.route("/:saleOrderId").delete(saleOrderControllers.destroy);
/**actions */
saleOrderRouter
  .route("/:saleOrderId/calculate")
  .get(saleOrderControllers.calculateSaleOrder);
saleOrderRouter
  .route("/:saleOrderId/complete-order/")
  .post(saleOrderControllers.completeSaleOrder);

/** order products */
saleOrderRouter
  .route("/:saleOrderId/order-items")
  .get(
    validateQuery(saleOrderItemQuerySchema),
    saleOrderControllers.listSaleOrderItems
  );
saleOrderRouter
  .route("/:saleOrderId/order-items/")
  .post(saleOrderControllers.createSaleOrderItems);

saleOrderRouter
  .route("/:saleOrderId/order-items/:saleOrderItemId")
  .put(saleOrderControllers.updateSaleOrderItem)
  .delete(saleOrderControllers.destroySaleOrderItem);

export default saleOrderRouter;
