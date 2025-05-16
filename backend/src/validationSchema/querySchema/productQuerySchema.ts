import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export type ProductQuerySchema = {
  categoryId?: string;
  search?: string;
};

export type ProductVariantQuerySchema = {
  ids?: string[];
  barcode?: string;
  search?: string;
};

export const productQuerySchema = baseQuerySchema.append<ProductQuerySchema>({
  categoryId: Joi.string().uuid(),
  search: Joi.string().allow(""),
});

export const productVariantQuerySchema =
  baseQuerySchema.append<ProductVariantQuerySchema>({
    ids: Joi.array().items(Joi.string().uuid()),
    barcode: Joi.string().allow(""),
    search: Joi.string().allow(""),
  });
