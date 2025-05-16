import AppDataSource from "@/data-source";
import { Settings } from "@/settings";
import { NextFunction, Request, RequestHandler, Response } from "express";

// .addSelect("COALESCE(MAX(purchaseItems.price), 0)", "max_purchase_price");

export default class GeneralAnalysisControllers {
  generalAnalysis: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const generalMetrices = await AppDataSource.query(`
        WITH first_analysis AS (
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
        second_analysis as (
            SELECT
                COUNT(*) as out_of_stock
            FROM
                inventory
            WHERE
                (inventory.available + inventory.reserved) = 0
        ),
        third_analysis as (
            SELECT
                COUNT(*) as low_stock
            FROM
                inventory
            WHERE
                (inventory.available + inventory.reserved) < inventory.minimum
        ),
        today_sale AS (
            SELECT
                COALESCE(
                    SUM(
                        sale_item.price * sale_item.quantity - sale_item.discount
                    ),
                    0
                ) as today_sale
            FROM
                sale_item
            WHERE
                sale_item."createdAt" >= (
                    date_trunc('day', now() AT TIME ZONE '${Settings.TIMEZONE}') AT TIME ZONE '${Settings.TIMEZONE}'
                )
                AND sale_item."createdAt" < (
                    (
                        date_trunc('day', now() AT TIME ZONE '${Settings.TIMEZONE}') + INTERVAL '1 day'
                    ) AT TIME ZONE '${Settings.TIMEZONE}'
                )
        ),
        today_purchase AS (
            SELECT
                COALESCE(
                    SUM(
                        purchase_item.price * purchase_item.quantity
                    ),
                    0
                ) as today_purchase
            FROM
                purchase_item
            WHERE
                purchase_item."createdAt" >= (
                    date_trunc('day', now() AT TIME ZONE '${Settings.TIMEZONE}') AT TIME ZONE '${Settings.TIMEZONE}'
                )
                AND purchase_item."createdAt" < (
                    (
                        date_trunc('day', now() AT TIME ZONE '${Settings.TIMEZONE}') + INTERVAL '1 day'
                    ) AT TIME ZONE '${Settings.TIMEZONE}'
                )
        )
        SELECT
            *
        FROM
            first_analysis,
            second_analysis,
            third_analysis,
            today_sale,
            today_purchase
        `);
    res.status(200).json(generalMetrices[0]);
  };

  getWeekWiseAnalysis = async (req: Request) => {
    return (
      await AppDataSource.query<any[]>(`
      WITH sales AS (
          SELECT
              date_trunc('week', "createdAt") AS week,
              SUM(sale_item.quantity * sale_item.price) AS revenue
          FROM
              "sale_item"
          GROUP BY
              week
      ),
      purchases AS (
          SELECT
              date_trunc('week', "createdAt") AS week,
              SUM(quantity) AS expense
          FROM
              "purchase_item"
          GROUP BY
              week
      )
      SELECT
          COALESCE(s.week, p.week) AS week,
          COALESCE(s.revenue, 0) AS revenue,
          COALESCE(p.expense, 0) AS expense
      FROM
          sales s FULL
          OUTER JOIN purchases p ON s.week = p.week;
  `)
    ).map((info) => ({
      ...info,
      revenue: info.revenue,
      expense: info.expense,
    }));
  };
}
