import { NextFunction, Request, Response } from "express";

export default class SaleAnalysisControllers {
  constructor() {}

  orderAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    // const hourlyOrders = await AppDataSource.getRepository(OrderItem)
    //   .createQueryBuilder("orderItem")
    //   .select("DATE_TRUNC('hour', orderItem.createdAt)", "hour")
    //   .addSelect("SUM(orderItem.price * orderItem.quantity)", "total_sales")
    //   .groupBy("DATE_TRUNC('hour', orderItem.createdAt)")
    //   .orderBy("hour", "ASC")
    //   .getRawMany();

    res.status(200).json({});
  };
}
