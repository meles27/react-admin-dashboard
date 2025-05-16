import { PurchaseControllers } from "@/controllers/purchaseControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import {
  purchaseItemQuerySchema,
  purchaseQuerySchema,
} from "@/validationSchema/querySchema/purchaseQuerySchema";
import { Router } from "express";

const allowedRoles: USER_ROLE[] = [USER_ROLE.ADMIN];
const purchaseRouter = Router().use(isAllowedTo(allowedRoles));

/**
 * purchase routes
 */
const purchaseControllers = new PurchaseControllers();
purchaseRouter
  .route("")
  .get(validateQuery(purchaseQuerySchema), purchaseControllers.list);

purchaseRouter
  .route("/:purchaseId/purchase-items")
  .get(
    validateQuery(purchaseItemQuerySchema),
    purchaseControllers.listPurchaseItems
  );

export default purchaseRouter;
