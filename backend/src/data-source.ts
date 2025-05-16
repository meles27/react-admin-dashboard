import "module-alias/register";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Inventory } from "./entity/Inventory";
import { Purchase } from "./entity/Purchase";
import { PurchaseItem } from "./entity/PurchaseItem";
import { PurchaseItemReturn } from "./entity/PurchaseItemReturn";
import { ResetToken } from "./entity/ResetToken";
import { Sale } from "./entity/Sale";
import { SaleItem } from "./entity/SaleItem";
import { SaleItemReturn } from "./entity/SaleItemReturn";
import { Supplier } from "./entity/Supplier";
import { SystemSetting } from "./entity/SystemSetting";
import { User } from "./entity/User";
import { PurchaseOrder } from "./entity/order/PurchaseOrder";
import { PurchaseOrderItem } from "./entity/order/PurchaseOrderItem";
import { SaleOrder } from "./entity/order/SaleOrder";
import { SaleOrderItem } from "./entity/order/SaleOrderItem";
import { Category } from "./entity/product/Category";
import { Product } from "./entity/product/Product";
import { ProductVariant } from "./entity/product/ProductVariant";
import { VariantImage } from "./entity/product/VariantImage";
import { Settings } from "./settings";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Settings.DATABASE.HOST,
  port: Settings.DATABASE.PORT,
  username: Settings.DATABASE.USERNAME,
  password: Settings.DATABASE.PASSWORD,
  database: Settings.DATABASE.DB_NAME,
  synchronize: Settings.DATABASE.SYNCHRONIZE,
  logging: false,
  entities: [
    User,
    ResetToken,
    Category,
    Product,
    Sale,
    SaleItem,
    SaleItemReturn,
    Purchase,
    PurchaseItem,
    PurchaseItemReturn,
    VariantImage,
    ProductVariant,
    Inventory,
    SaleOrder,
    PurchaseOrder,
    SaleOrderItem,
    PurchaseOrderItem,
    Supplier,
    SystemSetting,
  ],
  migrations: ["./src/migrations/*.ts"],
  migrationsTableName: "migrations",
  migrationsRun: true,
  subscribers: [],
});

export default AppDataSource;
