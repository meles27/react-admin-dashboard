import Joi from "joi";
import { attributeCreateSchema, attributeUpdateSchema } from "./baseSchema";
import { parseJson } from "./stringObjvalidationExtension";

export const createProductVariantSchema = Joi.object<{
  name: string;
  barcode: string;
  price: number;
  attributes: Record<string, any>;
}>({
  name: Joi.string().required(),
  barcode: Joi.string(),
  price: Joi.number().precision(3).max(9999999.999).required(),
  attributes: parseJson(attributeCreateSchema),
});

export const updateProductVariantSchema = Joi.object<{
  name: string;
  barcode: string;
  price: number;
  attributes: Record<string, any>;
  // "keep-images": Array<string>;
}>({
  name: Joi.string().optional(),
  barcode: Joi.string().optional(),
  price: Joi.number().precision(3).min(0).max(9999999.999).optional(),
  attributes: parseJson(attributeUpdateSchema).optional(),
  // "keep-images": Joi.array().items(Joi.string().allow("")).default([]),
});
