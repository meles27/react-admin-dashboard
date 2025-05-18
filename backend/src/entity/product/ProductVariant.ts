import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Inventory } from "../Inventory";
import { SaleOrderItem } from "../order/SaleOrderItem";
import { SaleItem } from "../SaleItem";
import { Product } from "./Product";

// Define an enumeration for inventory measurement units
export enum InventoryUnit {
  PIECES = "pcs",
  KILOGRAMS = "kg",
  LITERS = "L",
  METERS = "m",
  BOXES = "boxes",
  PALLETS = "pallets",
  DOZENS = "dozens",
  GALLONS = "gallons",
  SETS = "sets",
  SQUARE_METERS = "m²",
}

@Entity()
@Index("unique_barcode", ["barcode"], {
  unique: true,
  where: "barcode IS NOT NULL",
}) // Partial Unique Index
export class ProductVariant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  barcode?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({
    type: "enum",
    enum: InventoryUnit,
    default: InventoryUnit.PIECES,
  })
  unit: InventoryUnit; // Use the enum type

  @Column("jsonb", { default: {} })
  attributes: Record<string, number | boolean | string | object | Array<any>>;

  @Column("varchar", { array: true, default: [] })
  images: string[];

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

  @DeleteDateColumn({
    nullable: true,
    type: "timestamptz",
    precision: 3,
  })
  deletedAt: Date;

  @ManyToOne(() => Product, (product) => product.productVariants, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  product: Product;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.productVariant)
  saleItems: SaleItem[];

  @OneToMany(() => SaleOrderItem, (orderProduct) => orderProduct.productVariant)
  saleOrderItems: SaleOrderItem[];

  @OneToOne(() => Inventory, (inventory) => inventory.productVariant)
  inventory: Inventory;
}
