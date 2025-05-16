import { AppDataSource } from "@/data-source";
import { Purchase } from "@/entity/Purchase";
import { PurchaseItem } from "@/entity/PurchaseItem";
import { Supplier } from "@/entity/Supplier";
import { User, USER_ROLE } from "@/entity/User";
import { PaginatedResponseIface } from "@/types";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { PurchaseQuerySchema } from "@/validationSchema/querySchema/purchaseQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Repository } from "typeorm";
import { BaseControllers } from "./baseControllers";

/**
 * type definition for custom purchase.
 */
type CustomPurchaseType = Omit<
  Purchase,
  "purchaseAgent" | "supplier" | "purchaseItems"
> & {
  purchaseAgent: Pick<
    User,
    "id" | "username" | "firstName" | "lastName" | "image"
  >;
} & {
  supplier: Pick<Supplier, "id" | "name" | "supplierType" | "contactEmail">;
} & {
  total_items: string;
  total_price: string;
};

export class PurchaseControllers extends BaseControllers<Purchase> {
  private readonly purchaseItemRepository: Repository<PurchaseItem>;
  constructor() {
    super(Purchase);
    this.objectId = "purchaseId";
    this.purchaseItemRepository = AppDataSource.getRepository(PurchaseItem);
  }

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: BaseQuerySchema & PurchaseQuerySchema = req.query as any;
    const queryBuilder = this.repository
      .createQueryBuilder("purchase")
      .withDeleted()
      .leftJoin("purchase.purchaseAgent", "purchaseAgent")
      .leftJoin("purchase.supplier", "supplier")
      .leftJoin("purchase.purchaseItems", "purchaseItems")
      .select("purchase")
      .addSelect("supplier")
      .addSelect("purchaseAgent")
      .addSelect("COALESCE(SUM(purchaseItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM(purchaseItems.price * purchaseItems.quantity),0)",
        "total_price"
      );

    /**
     * check for admin
     */
    if (req.user?.role == USER_ROLE.ADMIN) {
      if (query.purchaseAgentId) {
        queryBuilder.andWhere("purchase.purchaseAgent = :purchaseAgentId", {
          purchaseAgentId: query.purchaseAgentId,
        });
      }
    } else {
      queryBuilder.andWhere("purchase.purchaseAgent = :purchaseAgentId", {
        purchaseAgentId: req.user.id,
      });
    }

    if (query.purchaseAgentId) {
      queryBuilder.andWhere("purchase.purchaseAgent = :purchaseAgentId", {
        purchaseAgentId: query.purchaseAgentId,
      });
    }

    if (query.from && query.to) {
      queryBuilder.andWhere("purchase.createdAt BETWEEN :from AND :to", {
        from: query.from,
        to: query.to,
      });
    }

    const purchases = await queryBuilder
      .offset(query.offset)
      .limit(query.limit)
      .groupBy("purchase.id, purchaseAgent.id, supplier.id")
      .orderBy("purchase.createdAt", "DESC")
      .getRawMany();

    const total = await queryBuilder.getCount();

    const response: PaginatedResponseIface<CustomPurchaseType> = {
      count: total,
      next: null,
      previous: null,
      results: purchases.map((purchase) => {
        return {
          id: purchase.purchase_id,
          isReturned: purchase.purchase_isReturned,
          createdAt: purchase.purchase_createdAt,
          updatedAt: purchase.purchase_updatedAt,
          purchaseAgent: {
            id: purchase.purchaseAgent_id,
            username: purchase.purchaseAgent_username,
            firstName: purchase.purchaseAgent_firstName,
            lastName: purchase.purchaseAgent_lastName,
            image: purchase.purchaseAgent_image,
          },
          supplier: {
            id: purchase.supplier_id,
            name: purchase.supplier_name,
            supplierType: purchase.supplier_supplierType,
            contactEmail: purchase.supplier_contactEmail,
          },
          total_items: purchase.total_items,
          total_price: purchase.total_price,
        };
      }),
    };
    res.status(200).json(response);
  };

  listPurchaseItems: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema = req.query as any;
    const [purchaseItems, total] =
      await this.purchaseItemRepository.findAndCount({
        where: {
          purchase: { id: req.params[this.objectId] },
        },
        relations: {
          productVariant: {
            images: true,
          },
        },
        withDeleted: true,
        skip: queryParams.offset,
        take: queryParams.limit,
      });

    const response: PaginatedResponseIface<any> = {
      count: total,
      next: null,
      previous: null,
      results: purchaseItems,
    };
    res.status(200).json(response);
  };
}
