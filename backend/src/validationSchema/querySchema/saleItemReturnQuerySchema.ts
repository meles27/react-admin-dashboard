import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";
import { SALE_RETURN_STATUS } from "@/entity/SaleItemReturn";

export type SaleItemReturnQuerySchema = {
  from?: Date;
  to?: Date;
  status?: SALE_RETURN_STATUS;
  requestedBy?: string;
  approvedBy?: string;
  search?: string;
  productCode?: string;
};

export const saleItemReturnQuerySchema =
  baseQuerySchema.append<SaleItemReturnQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
    status: Joi.string().valid(...Object.values(SALE_RETURN_STATUS)),
    requestedBy: Joi.string().uuid().allow(""),
    approvedBy: Joi.string().uuid().allow(""),
    productCode: Joi.string().allow(""),
    search: Joi.string().allow(""),
  });
