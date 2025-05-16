import { SupplierControllers } from "@/controllers/supplierControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import { supplierQuerySchema } from "@/validationSchema/querySchema/supplierQuerySchema";
import { Router } from "express";

const supplierRouter = Router();
/**
 * sales route
 */
const supplierControllers = new SupplierControllers();
supplierRouter
  .use(isAllowedTo([USER_ROLE.ADMIN]))
  .route("")
  .get(validateQuery(supplierQuerySchema), supplierControllers.list)
  .post(supplierControllers.create);

supplierRouter
  .route("/:supplierId")
  .get(supplierControllers.retreive)
  .put(supplierControllers.update)
  .delete(supplierControllers.destroy);
export default supplierRouter;
