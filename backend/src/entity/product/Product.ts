import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./Category";
import { ProductVariant } from "./ProductVariant";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  hero: string;

  @Column({ nullable: true })
  hero_public_id: string;

  @Column("jsonb", { default: {} })
  attributes: Record<string, number | boolean | string | object | Array<any>>;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  category: Category;

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

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product, {
    cascade: true,
  })
  productVariants: ProductVariant[];
}
