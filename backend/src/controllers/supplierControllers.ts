import { Supplier } from "@/entity/Supplier";
import { PaginatedResponseIface } from "@/types";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "@/validationSchema/bodySchema/supplierSchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { SupplierQuerySchema } from "@/validationSchema/querySchema/supplierQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { BaseControllers } from "./baseControllers";

export class SupplierControllers extends BaseControllers<Supplier> {
  constructor() {
    super(Supplier);
    this.objectId = "supplierId";
  }

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: BaseQuerySchema & SupplierQuerySchema = req.query as any;
    const [suppliers, total] = await this.repository.findAndCount({
      take: query.limit,
      skip: query.offset,
    });
    const response: PaginatedResponseIface<Supplier> = {
      count: total,
      next: null,
      previous: null,
      results: suppliers,
    };
    res.status(200).json(response);
  };

  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await createSupplierSchema.validateAsync(req.body);
    const supplier = new Supplier();
    Object.assign(supplier, validatedData);
    const response = await this.repository.save(supplier);
    res.status(201).json(response);
  };

  retreive: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const supplier = await this.getObject(req);
    res.status(200).json(supplier);
  };

  update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await updateSupplierSchema.validateAsync(req.body);
    const supplier = await this.getObject(req);
    Object.assign(supplier, validatedData);
    const response = await this.repository.save(supplier);
    res.status(200).json(response);
  };

  destroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const supplier = await this.getObject(req);
    const response = await this.repository.remove(supplier);
    res.status(204).json();
  };
}
