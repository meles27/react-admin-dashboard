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
import { PurchaseOrderItem } from "../order/PurchaseOrderItem";
import { SaleOrderItem } from "../order/SaleOrderItem";
import { PurchaseItem } from "../PurchaseItem";
import { SaleItem } from "../SaleItem";
import { Product } from "./Product";
import { VariantImage } from "./VariantImage";

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

interface ProductImage {
  // interface VariantImage {
  url: string;
  public_id: string;
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

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  icon_public_id: string;

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

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.productVariant)
  purchaseItems: PurchaseItem[];

  @OneToMany(() => SaleOrderItem, (orderProduct) => orderProduct.productVariant)
  saleOrderItems: SaleOrderItem[];

  @OneToMany(
    () => PurchaseOrderItem,
    (orderProduct) => orderProduct.productVariant
  )
  purchaseOrderItems: PurchaseOrderItem[];

  @OneToMany(() => VariantImage, (image) => image.productVariant)
  images: VariantImage[];

  @OneToOne(() => Inventory, (inventory) => inventory.productVariant)
  inventory: Inventory;
}
