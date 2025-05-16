import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PurchaseOrder } from "./order/PurchaseOrder";

export enum SUPPLIER_TYPE {
  INDIVIDUAL = "individual",
  ORGANIZATION = "organization",
}
@Entity()
export class Supplier {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column({ type: "enum", enum: SUPPLIER_TYPE })
  supplierType: SUPPLIER_TYPE; // Type of supplier

  @Column()
  paymentTerms: string;

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.supplier)
  purchaseOrders: PurchaseOrder[];
}
