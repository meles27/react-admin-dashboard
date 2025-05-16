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
import { Sale } from "./Sale";
import { SaleItemReturn } from "./SaleItemReturn";

@Entity()
export class SaleItem {
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

  // @DeleteDateColumn({
  //   nullable: true,
  //   type: "timestamptz",
  //   precision: 3,
  //   default: () => "CURRENT_TIMESTAMP",
  // })
  // deletedAt: Date;

  @ManyToOne(() => Sale, (sale) => sale.saleItems, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  sale: Sale;

  @ManyToOne(
    () => ProductVariant,
    (productVariant) => productVariant.saleItems,
    { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false }
  )
  productVariant: ProductVariant;

  @OneToMany(() => SaleItemReturn, (returnItem) => returnItem.saleItem)
  saleItemReturns: SaleItemReturn[];
}
