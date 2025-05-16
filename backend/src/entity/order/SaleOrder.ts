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
import { User } from "../User";
import { SaleOrderItem } from "./SaleOrderItem";

export enum SALE_ORDER_STATUS {
  PENDING = "pending",
  RETURNED = "returned",
  COMPLETED = "completed",
}

@Entity()
export class SaleOrder {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: SALE_ORDER_STATUS,
    default: SALE_ORDER_STATUS.PENDING,
  })
  status: SALE_ORDER_STATUS;

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

  @ManyToOne(() => User, (saleAgent) => saleAgent.saleOrders, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  saleAgent: User;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: true,
  })
  @JoinColumn()
  customer: User;

  @OneToMany(() => SaleOrderItem, (saleOrderItem) => saleOrderItem.saleOrder)
  saleOrderItems: SaleOrderItem[];
}
