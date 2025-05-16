import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export type PurchaseQuerySchema = {
  from?: Date;
  to?: Date;
  purchaseAgentId?: string;
};

export type PurchaseItemQuerySchema = {
  from?: Date;
  to?: Date;
  categoryId?: string;
  productId?: string;
  variantId?: string;
};

export const purchaseQuerySchema = baseQuerySchema.append<PurchaseQuerySchema>({
  from: Joi.date().default("1970-01-01T00:00:00Z"),
  to: Joi.date()
    .greater(Joi.ref("from"))
    .message("to must be greater than from"),
  purchaseAgentId: Joi.string().allow("").uuid(),
});

export const purchaseItemQuerySchema =
  baseQuerySchema.append<PurchaseItemQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
    categoryId: Joi.string().uuid(),
    productId: Joi.string().uuid(),
    variantId: Joi.string().uuid(),
  });
