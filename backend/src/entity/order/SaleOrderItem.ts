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
import { SaleOrder } from "./SaleOrder";

@Entity()
@Unique(["saleOrder", "productVariant"])
export class SaleOrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  discount: number;

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

  @ManyToOne(() => SaleOrder, (saleOrder) => saleOrder.saleOrderItems, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  saleOrder: SaleOrder;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.saleOrderItems,
    { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false }
  )
  productVariant: ProductVariant;
}
