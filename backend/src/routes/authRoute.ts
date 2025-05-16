import { AuthControllers } from "@/controllers/auth/authControllers";
import { Router } from "express";

const authRouter = Router();

/**
 * Authentication Routes .
 */
authRouter.route("/token").post(AuthControllers.jwtToken);
authRouter.route("/token/refresh").post(AuthControllers.refreshToken);
/**
 * reset password
 */
authRouter.route("/reset-password").post(AuthControllers.requestPasswordReset);
authRouter.route("/confirm-reset-password").post(AuthControllers.resetPassword);

export default authRouter;
