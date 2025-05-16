// Inventory Entity
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProductVariant } from "./product/ProductVariant";

// Inventory Entity for each variant
@Entity()
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: 15 })
  minimum: number;

  @Column({ default: 0 })
  available: number;

  @Column({ default: 0 })
  reserved: number;

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

  @OneToOne(
    () => ProductVariant,
    (productVariant) => productVariant.inventory,
    { nullable: false, onDelete: "CASCADE", onUpdate: "CASCADE" }
  )
  @JoinColumn()
  productVariant: ProductVariant;
}
