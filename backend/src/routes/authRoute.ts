import { AuthControllers } from "@/controllers/auth/authControllers";
import { Router } from "express";

const authRouter = Router();

/**
 * Authentication Routes .
 */
authRouter.route("/token").post(AuthControllers.jwtToken);
authRouter.route("/token/refresh").post(AuthControllers.refreshToken);

export default authRouter;
