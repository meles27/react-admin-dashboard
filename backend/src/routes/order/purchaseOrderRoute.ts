import { PurchaseOrderControllers } from "@/controllers/order/purchaseOrderControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import {
  purchaseOrderItemQuerySchema,
  purchaseOrderQuerySchema,
} from "@/validationSchema/querySchema/order/purchaseOrderQuerySchema";
import { Router } from "express";

const purchaseOrderControllers = new PurchaseOrderControllers();

const allowedRoles: USER_ROLE[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.CASHIER,
  USER_ROLE.STAFF,
];
const purchaseOrderRouter = Router().use(isAllowedTo(allowedRoles));

purchaseOrderRouter
  .route("")
  .get(validateQuery(purchaseOrderQuerySchema), purchaseOrderControllers.list)
  .post(purchaseOrderControllers.create);

purchaseOrderRouter
  .route("/:purchaseOrderId")
  .delete(purchaseOrderControllers.destroy);
/**actions */
purchaseOrderRouter
  .route("/:purchaseOrderId/calculate")
  .get(purchaseOrderControllers.calculatePurchaseOrder);
purchaseOrderRouter
  .route("/:purchaseOrderId/complete-order/")
  .post(purchaseOrderControllers.completePurchaseOrder);

/** order products */
purchaseOrderRouter
  .route("/:purchaseOrderId/order-items")
  .get(
    validateQuery(purchaseOrderItemQuerySchema),
    purchaseOrderControllers.listPurchaseOrderItems
  );
purchaseOrderRouter
  .route("/:purchaseOrderId/order-items/")
  .post(purchaseOrderControllers.createPurchaseOrderItems);

purchaseOrderRouter
  .route("/:purchaseOrderId/order-items/:purchaseOrderItemId")
  .put(purchaseOrderControllers.updatePurchaseOrderItem)
  .delete(purchaseOrderControllers.destroyPurchaseOrderItem);

export default purchaseOrderRouter;
