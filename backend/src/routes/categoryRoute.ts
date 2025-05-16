import { CategoryControllers } from "@/controllers/categoryControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import upload from "@/utils/multerConfig";
import { categoryQuerySchema } from "@/validationSchema/querySchema/categoryQuerySchema";
import { Router } from "express";

const allowedRoles: USER_ROLE[] = [USER_ROLE.ADMIN];
const categoryRouter = Router();
/**
 * categories routes
 */
const categoryControllers = new CategoryControllers();
categoryRouter
  .route("")
  .get(validateQuery(categoryQuerySchema), categoryControllers.list)
  .post(
    isAllowedTo(allowedRoles),
    upload.single("image"),
    categoryControllers.create
  );
categoryRouter
  .route("/:categoryId")
  .get(categoryControllers.retrieve)
  .put(
    isAllowedTo(allowedRoles),
    upload.single("image"),
    categoryControllers.update
  )
  .delete(isAllowedTo(allowedRoles), categoryControllers.softDestroy);

export default categoryRouter;
