import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SaleItem } from "./SaleItem";
import { User } from "./User";

export enum ReturnReason {
  DAMAGED = "damaged",
  EXPIRED = "expired",
  WRONG_ITEM = "wrong_item",
  CUSTOMER_CHANGED_MIND = "customer_changed_mind",
  DEFECTIVE = "defective",
  OTHER = "other",
}

export enum SALE_RETURN_STATUS {
  PENDING = "pending", // Return has been requested, but not yet processed.
  APPROVED = "approved", // Return approved but refund and/or restock not completed.
  // REFUNDED = "refunded", // Money has been refunded to the customer.
  // RESTOCKED = "restocked", // Item has been returned and successfully restocked in inventory.
  // REJECTED = "rejected", // Return request was denied (damaged, outside policy, etc.).
  // COMPLETED = "completed", // Both refund and restock are finalized.
}

@Entity()
export class SaleItemReturn {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => SaleItem, (saleItem) => saleItem.saleItemReturns, {
    nullable: false,
  })
  saleItem: SaleItem;

  @Column()
  quantity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  refund: number;

  @Column({
    type: "enum",
    enum: ReturnReason,
    default: ReturnReason.OTHER,
  })
  reason: ReturnReason;

  @CreateDateColumn({
    type: "timestamptz",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP",
  })
  requestedAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP",
  })
  returnedAt: Date;

  @Column({
    type: "enum",
    enum: SALE_RETURN_STATUS,
    default: SALE_RETURN_STATUS.PENDING,
  })
  status: SALE_RETURN_STATUS;

  @Column("text", { nullable: true })
  notes: string | null;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  requestedBy: User;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User;
}
