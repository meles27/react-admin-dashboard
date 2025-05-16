import GeneralAnalysisControllers from "@/controllers/analysis/generalAnalysisControllers";
import OrderAnalysisControllers from "@/controllers/analysis/orderAnalysisControllers";
import SaleAnalysisControllers from "@/controllers/analysis/saleAnalysisControllers";
import { USER_ROLE } from "@/entity/User";
import { isAllowedTo } from "@/middleware/permissions";
import { validateQuery } from "@/middleware/validateQuery";
import {
  popularSaleQuerySchema,
  saleMatricesQuerySchema,
  saleTrendAnalysisQuerySchema,
} from "@/validationSchema/querySchema/analysisQuerySchema/saleAnalysisQuerySchema";
import { Router } from "express";

const generalAnalysisControllers = new GeneralAnalysisControllers();
const orderAnalysisControllers = new OrderAnalysisControllers();
const saleAnalysisControllers = new SaleAnalysisControllers();

const allowedRoles: USER_ROLE[] = [USER_ROLE.ADMIN];
// router
const analysisRouter = Router({ mergeParams: true });
analysisRouter.use(isAllowedTo(allowedRoles));
// general analysis
analysisRouter
  .route("/general")
  .get(generalAnalysisControllers.generalAnalysis);
analysisRouter.route("/orders").get(orderAnalysisControllers.orderAnalysis);

// sale analysis
analysisRouter
  .route("/sales")
  .get(
    validateQuery(saleMatricesQuerySchema),
    saleAnalysisControllers.saleAnalysis
  );
//
analysisRouter
  .route("/sales/trends")
  .get(
    validateQuery(saleTrendAnalysisQuerySchema),
    saleAnalysisControllers.saleTrends
  );
analysisRouter
  .route("/sales/popular-products")
  .get(
    validateQuery(popularSaleQuerySchema),
    saleAnalysisControllers.popularProducts
  );
export default analysisRouter;
