import { UserControllers } from "@/controllers/auth/userControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo, isAuthenticated } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import { userQuerySchema } from "@/validationSchema/querySchema/userQuerySchema";
import { Router } from "express";

const userControllers = new UserControllers();

const userRouter = Router().use(isAuthenticated);
/**
 * User Routes
 */
userRouter
  .route("")
  .get(validateQuery(userQuerySchema), userControllers.list)
  .post(isAllowedTo([USER_ROLE.ADMIN]), userControllers.create);

userRouter
  .route("/:userId")
  .get(userControllers.retrieve)
  .put(userControllers.update)
  .delete(isAllowedTo([USER_ROLE.ADMIN]), userControllers.softDestroy);

export default userRouter;
