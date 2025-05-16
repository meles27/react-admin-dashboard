import { InventoryControllers } from "@/controllers/inventoryControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import { inventoryQuerySchema } from "@/validationSchema/querySchema/inventoryQuerySchema";
import { Router } from "express";

const allowedRoles: USER_ROLE[] = [
  USER_ROLE.ADMIN,
  USER_ROLE.CASHIER,
  USER_ROLE.STAFF,
];
const inventoryRouter = Router().use(isAllowedTo(allowedRoles));
/**
 * inventory route
 */
const invetoryControllers = new InventoryControllers();
inventoryRouter
  .route("")
  .get(validateQuery(inventoryQuerySchema), invetoryControllers.list);

export default inventoryRouter;
