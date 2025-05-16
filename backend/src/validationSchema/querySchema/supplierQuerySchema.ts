import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export type SupplierQuerySchema = {
  search?: string;
};

export const supplierQuerySchema = baseQuerySchema.append<SupplierQuerySchema>({
  search: Joi.string().allow(""),
});
