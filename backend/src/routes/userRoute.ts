import { UserControllers } from "@/controllers/auth/userControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo, isAuthenticated } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import upload from "@/utils/multerConfig";
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
  .post(
    isAllowedTo([USER_ROLE.ADMIN]),
    upload.single("image"),
    userControllers.create
  );

userRouter
  .route("/:userId")
  .get(userControllers.retrieve)
  .put(upload.single("image"), userControllers.update)
  .delete(isAllowedTo([USER_ROLE.ADMIN]), userControllers.softDestroy);

userRouter
  .route("/:userId/change-status")
  .post(isAllowedTo([USER_ROLE.ADMIN]), userControllers.changeStatus);

userRouter
  .route("/:userId/change-role")
  .post(isAllowedTo([USER_ROLE.ADMIN]), userControllers.changeRole);

export default userRouter;
