import Joi from "joi";
import { baseQuerySchema } from "../baseQuerySchema";

export type SaleMatricesQuerySchema = {
  from?: Date;
  to?: Date;
};

export type PopularSaleQuerySchema = {
  from?: Date;
  to?: Date;
};

export type SaleTrendsAnalysisQuerySchema = {
  from?: Date;
  to?: Date;
};

/**
 * analysis stage
 */
export const saleMatricesQuerySchema =
  baseQuerySchema.append<SaleMatricesQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
  });

export const saleTrendAnalysisQuerySchema =
  baseQuerySchema.append<SaleTrendsAnalysisQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
  });

export const popularSaleQuerySchema =
  baseQuerySchema.append<PopularSaleQuerySchema>({
    from: Joi.date().default("1970-01-01T00:00:00Z"),
    to: Joi.date()
      .greater(Joi.ref("from"))
      .message("to must be greater than from"),
  });
