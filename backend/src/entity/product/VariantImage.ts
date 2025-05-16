import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductVariant } from "./ProductVariant";

@Entity()
export class VariantImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  public_id: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, {
    onDelete: "CASCADE",
  })
  productVariant: ProductVariant;
}
