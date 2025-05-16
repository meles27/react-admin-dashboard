import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { ProductVariant } from "../product/ProductVariant";
import { PurchaseOrder } from "./PurchaseOrder";

@Entity()
@Unique(["purchaseOrder", "productVariant"])
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({
    type: "timestamptz",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @ManyToOne(
    () => PurchaseOrder,
    (purchaseOrder) => purchaseOrder.purchaseOrderItems,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      nullable: false,
    }
  )
  purchaseOrder: PurchaseOrder;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.purchaseOrderItems,
    { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false }
  )
  productVariant: ProductVariant;
}
