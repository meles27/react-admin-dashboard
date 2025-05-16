import { Inventory } from "@/entity/Inventory";
import { PaginatedResponseIface } from "@/types";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import {
  INVENTORY_STATUS,
  InventoryQuerySchema,
} from "@/validationSchema/querySchema/inventoryQuerySchema";
import { NextFunction, Request, Response } from "express";
import { BaseControllers } from "./baseControllers";
import logger from "node-color-log";

export class InventoryControllers extends BaseControllers<Inventory> {
  constructor() {
    super(Inventory);
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    const queryParams: BaseQuerySchema & InventoryQuerySchema =
      req.query as any;

    const queryBuilder = this.repository
      .createQueryBuilder("inventory")
      .withDeleted()
      .leftJoin("inventory.productVariant", "productVariant")
      .leftJoin("productVariant.images", "images")
      .select("inventory")
      .addSelect("productVariant")
      .where("productVariant.deletedAt IS NULL");
    if (queryParams.search) {
      queryBuilder.andWhere("productVariant.name ILIKE :search", {
        search: `%${queryParams.search}%`,
      });
    }

    if (
      queryParams.status &&
      queryParams.status == INVENTORY_STATUS.OUT_OF_STOCK
    ) {
      queryBuilder.andWhere("inventory.available + inventory.reserved <= 0");
    }

    if (
      queryParams.status &&
      queryParams.status == INVENTORY_STATUS.LOW_STOCK
    ) {
      queryBuilder.andWhere(
        "inventory.available + inventory.reserved <= inventory.minimum"
      );
    }

    const [inventories, total] = await queryBuilder
      .limit(queryParams.limit)
      .offset(queryParams.offset)
      .getManyAndCount();

    const response: PaginatedResponseIface<any> = {
      count: total,
      next: null,
      previous: null,
      results: inventories.map((inventory) => ({
        ...inventory,
        productVariant: {
          ...inventory.productVariant,
          images: inventory.productVariant.images
            ? inventory.productVariant.images
            : [],
        },
      })),
    };
    res.status(200).json(response);
  };
}
