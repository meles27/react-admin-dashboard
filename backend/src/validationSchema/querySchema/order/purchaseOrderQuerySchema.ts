import Joi from "joi";
import { baseQuerySchema } from "../baseQuerySchema";
import { PURCHASE_ORDER_STATUS } from "@/entity/order/PurchaseOrder";

export type PurchaseOrderQuerySchema = {
  from?: Date;
  to?: Date;
  status?: PURCHASE_ORDER_STATUS;
  purchaseAgentId?: string;
};

export type PurchaseOrderItemQuerySchema = {
  from?: Date;
  to?: Date;
};

export const purchaseOrderQuerySchema =
  baseQuerySchema.append<PurchaseOrderQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
    purchaseAgentId: Joi.string().uuid().allow(""),
    status: Joi.string().valid(...Object.values(PURCHASE_ORDER_STATUS)),
  });

export const purchaseOrderItemQuerySchema =
  baseQuerySchema.append<PurchaseOrderItemQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
  });
