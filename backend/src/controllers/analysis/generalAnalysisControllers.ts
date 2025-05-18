import AppDataSource from "@/data-source";
import { NextFunction, Request, RequestHandler, Response } from "express";

// .addSelect("COALESCE(MAX(purchaseItems.price), 0)", "max_purchase_price");

export default class GeneralAnalysisControllers {
  generalAnalysis: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const generalMetrices = await AppDataSource.query(`
        WITH inventory_analysis AS (
            SELECT
                COALESCE(
                    SUM(
                        (inventory.available + inventory.reserved) * product_variant.price
                    ),
                    0
                ) as total_price,
                COALESCE(SUM(inventory.available + inventory.reserved), 0) as total_items
            FROM
                inventory
                LEFT JOIN product_variant ON inventory."productVariantId" = product_variant.id
        ),
        out_analysis as (
            SELECT
                COUNT(*) as out_of_stock
            FROM
                inventory
            WHERE
                (inventory.available + inventory.reserved) = 0
        ),
        low_analysis as (
            SELECT
                COUNT(*) as low_stock
            FROM
                inventory
            WHERE
                (inventory.available + inventory.reserved) < inventory.minimum
        ),
        sale_analysis AS (
            SELECT
                COALESCE(
                    SUM(
                        sale_item.price * sale_item.quantity - sale_item.discount
                    ),
                    0
                ) as total_sale_price,
                COALESCE(
                    SUM(
                        sale_item.quantity
                    ),
                    0
                ) as total_sale_items
            FROM
                sale_item
        ),
        user_analysis AS (
            SELECT
                count(*) as total_users
            FROM
                "user"
        )
        SELECT
            *
        FROM
            inventory_analysis,
            out_analysis,
            low_analysis,
            sale_analysis,
            user_analysis
        `);
    const response = {
      ...generalMetrices[0],
      sale_trend: await this.getMonthWiseAnalysis(req),
    };
    console.log("response", response);
    res.status(200).json(response);
  };

  getMonthWiseAnalysis = async (req: Request) => {
    return await AppDataSource.query<any[]>(`
      WITH sales AS (
          SELECT
              date_trunc('month', "createdAt") AS month,
              SUM(sale_item.quantity * sale_item.price) AS revenue
          FROM
              "sale_item"
          GROUP BY
              month
      )
      SELECT
          s.month AS month,
          COALESCE(s.revenue, 0) AS revenue
      FROM
          sales s
  `);
  };
}
