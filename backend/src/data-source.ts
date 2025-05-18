import "module-alias/register";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Inventory } from "./entity/Inventory";
import { ResetToken } from "./entity/ResetToken";
import { Sale } from "./entity/Sale";
import { SaleItem } from "./entity/SaleItem";
import { User } from "./entity/User";
import { SaleOrder } from "./entity/order/SaleOrder";
import { SaleOrderItem } from "./entity/order/SaleOrderItem";
import { Category } from "./entity/product/Category";
import { Product } from "./entity/product/Product";
import { ProductVariant } from "./entity/product/ProductVariant";
import { Settings } from "./settings";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Settings.DATABASE.HOST,
  port: Settings.DATABASE.PORT,
  username: Settings.DATABASE.USERNAME,
  password: Settings.DATABASE.PASSWORD,
  database: Settings.DATABASE.DB_NAME,
  synchronize: Settings.DATABASE.SYNCHRONIZE,
  logging: true,
  entities: [
    User,
    ResetToken,
    Category,
    Product,
    Sale,
    SaleItem,
    ProductVariant,
    Inventory,
    SaleOrder,
    SaleOrderItem,
  ],
  migrations: ["./src/migrations/*.ts"],
  migrationsTableName: "migrations",
  migrationsRun: true,
  subscribers: [],
});

export default AppDataSource;
