import { AppDataSource } from "@/data-source";
import { Sale } from "@/entity/Sale";
import { SaleItem } from "@/entity/SaleItem";
import { SALE_RETURN_STATUS } from "@/entity/SaleItemReturn";
import { User, USER_ROLE } from "@/entity/User";
import { PaginatedResponseIface } from "@/types";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import {
  SaleItemQuerySchema,
  SaleQuerySchema,
} from "@/validationSchema/querySchema/saleQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Repository } from "typeorm";
import { BaseControllers } from "./baseControllers";

type CustomSaleType = Omit<Sale, "saleItems" | "saleAgent" | "customer"> & {
  saleAgent: Pick<User, "id" | "firstName" | "lastName" | "username" | "image">;
  customer: Pick<User, "id" | "firstName" | "lastName" | "username" | "image">;
} & {
  total_items: string;
  total_price: string;
  total_discount: string;
  total_return_items: string;
  total_return_price: string;
};

export class SaleControllers extends BaseControllers<Sale> {
  private readonly saleItemRepository: Repository<SaleItem>;
  constructor() {
    super(Sale);
    this.saleItemRepository = AppDataSource.getRepository(SaleItem);
    this.objectId = "saleId";
  }

  static getUpdatedSaleFieldById: (
    saleRepository: Repository<Sale>,
    id: string
  ) => Promise<{
    id: string;
    total_items: string;
    total_price: string;
    total_discount: string;
    total_return_items: string;
    total_return_price: string;
  }> = async (saleRepository: Repository<Sale>, id: string) => {
    return await saleRepository
      .createQueryBuilder("sale")
      .withDeleted()
      .leftJoin("sale.saleItems", "saleItems")
      .leftJoin(
        "saleItems.saleItemReturns",
        "saleItemReturns",
        "saleItemReturns.status = :status",
        { status: SALE_RETURN_STATUS.APPROVED }
      )
      .select("sale.id", "id")
      .addSelect("COALESCE(SUM(saleItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM((saleItems.price * saleItems.quantity) - saleItems.discount), 0)",
        "total_price"
      )
      .addSelect("COALESCE(SUM(saleItems.discount),0)", "total_discount")
      .addSelect(
        "COALESCE(SUM(saleItemReturns.quantity),0)",
        "total_return_items"
      )
      .addSelect(
        "COALESCE(SUM(saleItemReturns.refund),0)",
        "total_return_price"
      )
      .where("sale.id = :saleId", { saleId: id })
      .groupBy("sale.id")
      .getRawOne();
  };

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: BaseQuerySchema & SaleQuerySchema = req.query as any;
    const queryBuilder = this.repository
      .createQueryBuilder("sale")
      .withDeleted()
      .leftJoin("sale.saleAgent", "saleAgent")
      .leftJoin("sale.customer", "customer")
      .leftJoin("sale.saleItems", "saleItems")
      .leftJoin(
        "saleItems.saleItemReturns",
        "saleItemReturns",
        "saleItemReturns.status = :status",
        { status: SALE_RETURN_STATUS.APPROVED }
      )
      .select("sale")
      .addSelect("customer")
      .addSelect("saleAgent")
      .addSelect("COALESCE(SUM(saleItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM((saleItems.price * saleItems.quantity) - saleItems.discount), 0)",
        "total_price"
      )
      .addSelect("COALESCE(SUM(saleItems.discount),0)", "total_discount")
      .addSelect(
        "COALESCE(SUM(saleItemReturns.quantity),0)",
        "total_return_items"
      )
      .addSelect(
        "COALESCE(SUM(saleItemReturns.refund),0)",
        "total_return_price"
      );
    /**
     * check for admin
     */
    if (req.user?.role == USER_ROLE.ADMIN) {
      if (query.saleAgentId) {
        queryBuilder.andWhere("sale.saleAgent = :saleAgentId", {
          saleAgentId: query.saleAgentId,
        });
      }
    } else {
      queryBuilder.andWhere("sale.saleAgent = :saleAgentId", {
        saleAgentId: req.user.id,
      });
    }
    /**
     * date range
     */
    if (query.from && query.to) {
      queryBuilder.andWhere("sale.createdAt BETWEEN :from AND :to", {
        from: query.from,
        to: query.to,
      });
    }

    const sales = await queryBuilder
      .limit(query.limit)
      .offset(query.offset)
      .groupBy("sale.id, saleAgent.id, customer.id")
      .orderBy("sale.createdAt", "DESC")
      .getRawMany();

    const total = await queryBuilder.getCount();
    const response: PaginatedResponseIface<CustomSaleType> = {
      count: total,
      next: null,
      previous: null,
      results: sales.map((sale) => {
        return {
          id: sale.sale_id,
          isReturned: sale.sale_isReturned,
          createdAt: sale.sale_createdAt,
          updatedAt: sale.sale_updatedAt,
          saleAgent: {
            id: sale.saleAgent_id,
            username: sale.saleAgent_username,
            firstName: sale.saleAgent_firstName,
            lastName: sale.saleAgent_lastName,
            image: sale.saleAgent_image,
          },
          customer: {
            id: sale.customer_id,
            username: sale.customer_username,
            firstName: sale.customer_firstName,
            lastName: sale.customer_lastName,
            image: sale.customer_image,
          },
          total_items: sale.total_items,
          total_price: sale.total_price,
          total_discount: sale.total_discount,
          total_return_items: sale.total_return_items,
          total_return_price: sale.total_return_price,
        };
      }),
    };
    res.status(200).json(response);
  };

  /** handler for the sale-details  */
  listSaleItems: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema & SaleItemQuerySchema = req.query as any;
    const [saleItems, total] = await this.saleItemRepository.findAndCount({
      where: {
        sale: { id: req.params[this.objectId] },
      },
      withDeleted: true,
      relations: {
        productVariant: {
          images: true,
        },
        saleItemReturns: true,
      },
      skip: queryParams.offset,
      take: queryParams.limit,
    });

    const response: PaginatedResponseIface<SaleItem> = {
      count: total,
      next: null,
      previous: null,
      results: saleItems,
    };
    res.status(200).json(response);
  };
}
