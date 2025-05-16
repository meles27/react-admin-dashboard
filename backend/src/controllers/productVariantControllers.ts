import { ProductVariant } from "@/entity/product/ProductVariant";
import { PaginatedResponseIface } from "@/types";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { ProductVariantQuerySchema } from "@/validationSchema/querySchema/productQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ILike, In } from "typeorm";
import { BaseControllers } from "./baseControllers";

export class ProductVariantControllers extends BaseControllers<ProductVariant> {
  constructor() {
    super(ProductVariant);
    this.objectId = "productVariantId";
  }

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema & ProductVariantQuerySchema =
      req.query as any;
    const [productVariants, total] = await this.repository.findAndCount({
      where: {
        id: queryParams.ids ? In(queryParams.ids) : undefined,
        barcode: queryParams.barcode ? queryParams.barcode : undefined,
        name: queryParams.search ? ILike(`%${queryParams.search}%`) : undefined,
      },
      relations: {
        inventory: true,
        images: true,
      },
      skip: queryParams.offset,
      take: queryParams.limit,
      order: {
        name: "ASC",
      },
    });
    const response: PaginatedResponseIface<ProductVariant> = {
      count: total,
      next: null,
      previous: null,
      results: productVariants,
    };
    res.status(200).json(response);
  };
}
