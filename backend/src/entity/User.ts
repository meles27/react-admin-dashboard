import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PurchaseOrder } from "./order/PurchaseOrder";
import { SaleOrder } from "./order/SaleOrder";
import { Purchase } from "./Purchase";
import { Sale } from "./Sale";
import { SaleItemReturn } from "./SaleItemReturn";

export enum USER_ROLE {
  ADMIN = "admin",
  USER = "user",
  STAFF = "staff",
  CASHIER = "cashier",
  // CUSTOMER = "customer",
  // SUPPLIER = "supplier",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 300, select: false })
  password: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  image_public_id: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: "enum", enum: USER_ROLE, default: USER_ROLE.USER })
  role: USER_ROLE;

  @CreateDateColumn({
    type: "timestamptz",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP",
  })
  dateJoined: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    precision: 3,
    default: () => "CURRENT_TIMESTAMP",
  })
  lastLogin: Date;

  @DeleteDateColumn({
    nullable: true,
    type: "timestamptz",
    precision: 3,
  })
  deletedAt: Date;

  @Column({ type: "jsonb", default: {} })
  attributes: {
    [key: string]: string | number | boolean | object | Array<any>;
  };

  @OneToMany(() => Sale, (sale) => sale.saleAgent)
  sales: Sale[];

  @OneToMany(() => Purchase, (purchase) => purchase.purchaseAgent)
  purchases: Purchase[];

  @OneToMany(
    () => PurchaseOrder,
    (purchaseOrder) => purchaseOrder.purchaseAgent
  )
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => SaleOrder, (saleOrder) => saleOrder.saleAgent)
  saleOrders: SaleOrder[];

  @OneToMany(
    () => SaleItemReturn,
    (saleItemReturn) => saleItemReturn.requestedBy
  )
  returnedSaleOrders: SaleItemReturn[];
}
