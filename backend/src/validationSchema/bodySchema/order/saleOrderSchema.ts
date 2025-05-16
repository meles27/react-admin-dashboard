import Joi from "joi";

/**
 * sale order schema
 */
export const createSaleOrderSchema = Joi.object<{ customerId: string }>({
  customerId: Joi.string().uuid().required(),
});

/**
 * create sale order schema
 */
export const createSaleOrderItemsSchema = Joi.array<
  {
    productVariant: string;
    quantity: number;
    discount: number;
  }[]
>().items({
  productVariant: Joi.string().uuid().required(),
  quantity: Joi.number().min(1).required(),
  discount: Joi.number().min(0).default(0),
});

export const updateSaleOrderItemSchema = Joi.object<{
  quantity: number;
  discount: number;
}>({
  quantity: Joi.number().min(1).required(),
  discount: Joi.number().min(0).default(0),
});

// export const createSaleOrderItemsSchema = Joi.array<
//   {
//     productVariant: string;
//     quantity: number;
//     discount: number;
//   }[]
// >()
//   .items(
//     Joi.object({
//       productVariant: Joi.string().uuid().required().messages({
//         "any.required": "Product variant is required.",
//         "string.empty": "Product variant cannot be empty.",
//         "string.guid": "Product variant must be a valid UUID.",
//       }),

//       quantity: Joi.number().min(1).required().messages({
//         "any.required": "Quantity is required.",
//         "number.base": "Quantity must be a number.",
//         "number.min": "Quantity must be at least 1.",
//       }),

//       discount: Joi.number().min(0).optional().messages({
//         "number.base": "Discount must be a number.",
//         "number.min": "Discount cannot be negative.",
//       }),
//     })
//   )
//   .min(1)
//   .messages({
//     "array.base": "Sale order items must be an array.",
//     "array.min": "At least one sale order item is required.",
//   });
