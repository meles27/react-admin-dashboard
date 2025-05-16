import { Product } from "@/entity/product/Product";
import Joi from "joi";
import { attributeCreateSchema, attributeUpdateSchema } from "./baseSchema";
import { parseJson } from "./stringObjvalidationExtension";

export const createProductSchema = Joi.object<
  Pick<Product, "name" | "description" | "attributes"> & { categoryId: string }
>({
  categoryId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  attributes: parseJson(attributeCreateSchema),
});

export const updateProductSchema = Joi.object<
  Partial<
    Pick<Product, "name" | "description" | "attributes"> & {
      categoryId: string;
    }
  >
>({
  categoryId: Joi.string().uuid().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  attributes: parseJson(attributeUpdateSchema).optional(),
});
