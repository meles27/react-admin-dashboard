import Joi from "joi";

export const saleItemReturnSchema = Joi.object<{
  quantity: number;
  saleItemId: string;
}>({
  saleItemId: Joi.string().uuid().required(),
  quantity: Joi.number().min(0).required(),
});

export const confirmSaleItemReturnSchema = Joi.object<{
  code: number;
}>({
  code: Joi.string().uuid().required(),
});
