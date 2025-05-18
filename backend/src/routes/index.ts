import { Router } from "express";
import analysisRouter from "./analysisRoute";
import authRouter from "./authRoute";
import inventoryRouter from "./inventoryRoute";
import productRouter from "./productRoute";
import productVariantRouter from "./productVariantRoute";
import saleRouter from "./saleRoute";
import userRouter from "./userRoute";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/product-variants", productVariantRouter);
router.use("/inventories", inventoryRouter);
router.use("/sales", saleRouter);
router.use("/analysis", analysisRouter);
export default router;
