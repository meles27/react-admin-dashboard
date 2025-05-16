import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Supplier } from "../Supplier";
import { User } from "../User";
import { PurchaseOrderItem } from "./PurchaseOrderItem";

export enum PURCHASE_ORDER_STATUS {
  PENDING = "pending",
  RETURNED = "returned",
}

@Entity()
export class PurchaseOrder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: PURCHASE_ORDER_STATUS,
    default: PURCHASE_ORDER_STATUS.PENDING,
  })
  status: PURCHASE_ORDER_STATUS;

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

  @ManyToOne(() => User, (purchaseAgent) => purchaseAgent.purchaseOrders, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  purchaseAgent: User;

  @ManyToOne(() => Supplier, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn()
  supplier: Supplier;

  @OneToMany(() => PurchaseOrderItem, (orderItem) => orderItem.purchaseOrder)
  purchaseOrderItems: PurchaseOrderItem[];
}
