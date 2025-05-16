import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export enum INVENTORY_STATUS {
  OUT_OF_STOCK = "out_of_stock",
  LOW_STOCK = "low_stock",
}
export type InventoryQuerySchema = {
  stock?: number;
  search?: string;
  code?: string;
  status?: string;
};

export const inventoryQuerySchema =
  baseQuerySchema.append<InventoryQuerySchema>({
    stock: Joi.number().min(0).message("stock must be greater than 0"),
    search: Joi.string().allow(""),
    code: Joi.string().allow(""),
    status: Joi.string()
      .allow("")
      .valid(...Object.values(INVENTORY_STATUS)),
  });
