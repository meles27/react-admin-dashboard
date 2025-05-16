import Joi from "joi";
import { baseQuerySchema } from "../baseQuerySchema";
import { SALE_ORDER_STATUS } from "@/entity/order/SaleOrder";

export type SaleOrderQuerySchema = {
  from?: Date;
  to?: Date;
  status?: SALE_ORDER_STATUS;
  saleAgentId?: string;
};

export type SaleOrderItemQuerySchema = {
  from?: Date;
  to?: Date;
};

export const saleOrderQuerySchema =
  baseQuerySchema.append<SaleOrderQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
    saleAgentId: Joi.string().uuid().allow(""),
    status: Joi.string().valid(...Object.values(SALE_ORDER_STATUS)),
  });

export const saleOrderItemQuerySchema =
  baseQuerySchema.append<SaleOrderItemQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
  });
