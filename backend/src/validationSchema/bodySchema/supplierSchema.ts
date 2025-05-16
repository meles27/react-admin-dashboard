import { SUPPLIER_TYPE } from "@/entity/Supplier";
import Joi from "joi";

export const createSupplierSchema = Joi.object<{
  name: string;
  contactEmail: string;
  contactPhone: string;
  supplierType: SUPPLIER_TYPE;
  paymentTerms: string;
}>({
  name: Joi.string().required(),
  contactEmail: Joi.string().required(),
  contactPhone: Joi.string().required(),
  paymentTerms: Joi.string().required(),
  supplierType: Joi.string()
    .valid(...Object.values(SUPPLIER_TYPE))
    .required(),
});

export const updateSupplierSchema = Joi.object<{
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  supplierType?: SUPPLIER_TYPE;
  paymentTerms?: string;
}>({
  name: Joi.string(),
  contactEmail: Joi.string(),
  contactPhone: Joi.string(),
  paymentTerms: Joi.string(),
  supplierType: Joi.string().valid(...Object.values(SUPPLIER_TYPE)),
});
