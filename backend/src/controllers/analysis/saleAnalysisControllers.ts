import AppDataSource from "@/data-source";
import { Inventory } from "@/entity/Inventory";
import { Product } from "@/entity/product/Product";
import { ProductVariant } from "@/entity/product/ProductVariant";
import { Sale } from "@/entity/Sale";
import { PaginatedResponseIface } from "@/types";
import {
  PopularSaleQuerySchema,
  SaleMatricesQuerySchema,
  SaleTrendsAnalysisQuerySchema,
} from "@/validationSchema/querySchema/analysisQuerySchema/saleAnalysisQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";

export default class SaleAnalysisControllers {
  inventoryRepository = AppDataSource.getRepository(Inventory);
  productVariantRepository = AppDataSource.getRepository(ProductVariant);
  productRepository = AppDataSource.getRepository(Product);
  saleRepository = AppDataSource.getRepository(Sale);
  constructor() {}

  saleAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    const query: SaleMatricesQuerySchema = req.query as any;
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        /**
         * per sale-agent sale analysis
         */
        const generalSales = await transactionManager.query(
          `
            WITH sale_analysis AS (
                SELECT
                    sale_item."productVariantId",
                    SUM(sale_item.quantity) AS total_sale_items,
                    SUM(
                        sale_item.quantity * sale_item.price - sale_item.discount
                    ) AS total_sale_price,
                    SUM(sale_item.discount) AS total_discount
                FROM
                    sale_item
                WHERE
                    sale_item."createdAt" BETWEEN $1
                    AND $2
                GROUP BY
                    sale_item."productVariantId"
            ),
            return_analysis AS (
                SELECT
                    sale_item."productVariantId",
                    COALESCE(SUM(sale_item_return.refund), 0) as total_refund_price,
                    COALESCE(SUM(sale_item_return.quantity), 0) as total_refund_items
                FROM
                    sale_item
                    LEFT JOIN sale_item_return ON sale_item.id = sale_item_return."saleItemId"
                    AND sale_item_return.status = 'approved'
                    AND sale_item_return."returnedAt" BETWEEN $1
                    AND $2
                GROUP BY
                    sale_item."productVariantId"
            )
            SELECT
                COALESCE(SUM(sale_analysis.total_sale_items), 0) as total_sale_items,
                COALESCE(SUM(sale_analysis.total_sale_price), 0) as total_sale_price,
                COALESCE(SUM(sale_analysis.total_discount), 0) as total_discount,
                COALESCE(SUM(return_analysis.total_refund_items), 0) as total_refund_items,
                COALESCE(SUM(return_analysis.total_refund_price), 0) as total_refund_price
            FROM
                sale_analysis
                FULL OUTER JOIN return_analysis ON sale_analysis."productVariantId" = return_analysis."productVariantId"
        `,
          [query.from, query.to || new Date()]
        );

        const perSaleAgentSales = await transactionManager.query(
          `
            WITH sale_item_info as (
                SELECT
                    "user".id,
                    "user".username,
                    "user"."firstName",
                    "user"."lastName",
                    "user"."image",
                    SUM(sale_item.quantity) AS total_sale_items,
                    SUM(
                        sale_item.quantity * sale_item.price - sale_item.discount
                    ) AS total_sale_price,
                    SUM(sale_item.discount) AS total_discount
                FROM
                    "user"
                    LEFT JOIN sale on "user".id = sale."saleAgentId"
                    LEFT JOIN "sale_item" ON sale.id = sale_item."saleId"
                WHERE
                    sale_item."createdAt" BETWEEN $1
                    AND $2
                GROUP BY
                    "user".id
            ),
            sale_item_return_info as (
                SELECT
                    "user".id,
                    "user".username,
                    "user"."firstName",
                    "user"."lastName",
                    "user"."image",
                    COALESCE(sum(sale_item_return.quantity), 0) as total_return_items,
                    COALESCE(
                        sum(sale_item_return.refund),
                        0
                    ) as total_return_price
                FROM
                    "user"
                    LEFT JOIN sale on "user".id = sale."saleAgentId"
                    LEFT JOIN "sale_item" ON sale.id = sale_item."saleId"
                    LEFT JOIN sale_item_return on sale_item.id = sale_item_return."saleItemId"
                    AND sale_item_return.status = 'approved'
                WHERE
                    sale_item_return."returnedAt" BETWEEN $1
                    AND $2
                GROUP BY
                    "user".id
            )
            SELECT
                -- user info
                COALESCE(sale_item_info.id, sale_item_return_info.id) AS id,
                COALESCE(
                    sale_item_info."firstName",
                    sale_item_return_info."firstName"
                ) AS "firstName",
                COALESCE(
                    sale_item_info."lastName",
                    sale_item_return_info."lastName"
                ) AS "lastName",
                COALESCE(
                    sale_item_info.image,
                    sale_item_return_info.image
                ) AS image,
                -- sale item info
                COALESCE(sale_item_info.total_sale_items, 0) AS total_sale_items,
                COALESCE(sale_item_info.total_sale_price, 0) AS total_sale_price,
                COALESCE(sale_item_info.total_discount, 0) AS total_discount,
                -- sale return info
                COALESCE(sale_item_return_info.total_return_items, 0) AS total_return_items,
                COALESCE(sale_item_return_info.total_return_price, 0) AS total_return_price
            FROM
                sale_item_info FULL
                OUTER JOIN sale_item_return_info on sale_item_info.id = sale_item_return_info.id
          `,
          [query.from, query.to || new Date()]
        );
        res.status(200).json({
          general_sales: generalSales[0],
          per_saleAgent_sales: perSaleAgentSales,
        });
      } catch (error) {
        next(error);
      }
    });
  };

  popularProducts: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: PopularSaleQuerySchema = req.query as any;
    const topTenProductsQueryBuilder = AppDataSource.getRepository(
      ProductVariant
    )
      .createQueryBuilder("productVariant")
      .leftJoin("productVariant.saleItems", "saleItems")
      .leftJoin("saleItems.sale", "sale")
      .select("productVariant")
      .addSelect(
        "COALESCE(SUM(saleItems.price * saleItems.quantity - saleItems.discount),0)",
        "revenue"
      )
      .addSelect("COALESCE(SUM(saleItems.quantity), 0)", "total_items")
      .groupBy("productVariant.id")
      .orderBy("total_items", "DESC")
      .addOrderBy("revenue", "DESC")
      .limit(10);

    if (query.from && query.to) {
      topTenProductsQueryBuilder.where(
        "saleItems.createdAt BETWEEN :from AND :to",
        {
          from: query.from,
          to: query.to,
        }
      );
    }

    const topTenProducts = await topTenProductsQueryBuilder.getRawMany<{
      totalProducts: string;
      totalValue: string;
    }>();

    const response: PaginatedResponseIface<any> = {
      count: topTenProducts.length,
      next: null,
      previous: null,
      results: topTenProducts.map((item) => {
        return Object.fromEntries(
          Object.entries(item).map(([key, value]) => {
            return [key.replace("productVariant_", ""), value];
          })
        );
      }),
    };
    res.status(200).json(response);
  };

  saleTrends: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: SaleTrendsAnalysisQuerySchema = req.query as any;
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        /**
         * interval analysis
         */
        const intervalSalesQueryBuilder = transactionManager
          .getRepository(Sale)
          .createQueryBuilder("sale")
          .leftJoin("sale.saleItems", "saleItems")
          .select("DATE_TRUNC('month', sale.createdAt)", "interval")
          .addSelect("SUM(saleItems.quantity)", "total_items")
          .addSelect("SUM(saleItems.price * saleItems.quantity)", "revenue")
          .where("NOT sale.isReturned");

        if (query.from && query.to) {
          intervalSalesQueryBuilder.andWhere(
            "sale.createdAt BETWEEN :from AND :to",
            {
              from: query.from,
              to: query.to,
            }
          );
        }

        const intervalSales = await intervalSalesQueryBuilder
          .groupBy("interval")
          .orderBy("interval", "ASC")
          .getRawMany();

        res.status(200).json(intervalSales);
      } catch (error) {
        next(error);
      }
    });
  };
}
