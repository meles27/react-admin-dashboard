import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export type SaleQuerySchema = {
  from?: Date;
  to?: Date;
  saleAgentId?: string;
};

export type SaleItemQuerySchema = {
  from?: Date;
  to?: Date;
};

export const saleQuerySchema = baseQuerySchema.append<SaleQuerySchema>({
  from: Joi.date().default("1970-01-01T00:00:00Z"),
  to: Joi.date()
    .greater(Joi.ref("from"))
    .message("to must be greater than from"),
  saleAgentId: Joi.string().uuid().allow(""),
});

export const saleItemQuerySchema = baseQuerySchema.append<SaleItemQuerySchema>({
  from: Joi.date().default("1970-01-01T00:00:00Z"),
  to: Joi.date()
    .greater(Joi.ref("from"))
    .message("to must be greater than from"),
});
