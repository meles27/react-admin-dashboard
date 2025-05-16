import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductVariant } from "./product/ProductVariant";
import { Purchase } from "./Purchase";
import { PurchaseItemReturn } from "./PurchaseItemReturn";

@Entity()
export class PurchaseItem {
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

  @ManyToOne(() => Purchase, (sale) => sale.purchaseItems, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  purchase: Purchase;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.purchaseItems,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
      nullable: false,
    }
  )
  productVariant: ProductVariant;

  @OneToMany(() => PurchaseItemReturn, (returnItem) => returnItem.purchaseItem)
  purchaseItemReturns: PurchaseItemReturn[];
}
