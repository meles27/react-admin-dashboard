import Joi from "joi";

/**
 * purchase order schema
 */
export const createPurchaseOrderSchema = Joi.object<{ supplierId: string }>({
  // supplierId: Joi.string().uuid().required(),
});

export const createPurchaseOrderItemsSchema = Joi.array<
  {
    productVariant: string;
    quantity: number;
    price: number;
  }[]
>().items({
  productVariant: Joi.string().uuid().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).optional(),
});
/**
 * update purchase order schema
 */
export const updatePurchaseOrderItemSchema = Joi.object<{
  quantity: number;
  price: number;
}>({
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).optional(),
});
