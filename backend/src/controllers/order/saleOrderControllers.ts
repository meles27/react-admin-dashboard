import { AppDataSource } from "@/data-source";
import { Inventory } from "@/entity/Inventory";
import { SaleOrder } from "@/entity/order/SaleOrder";
import { SaleOrderItem } from "@/entity/order/SaleOrderItem";
import { ProductVariant } from "@/entity/product/ProductVariant";
import { Sale } from "@/entity/Sale";
import { SaleItem } from "@/entity/SaleItem";
import { User, USER_ROLE } from "@/entity/User";
import { throwErrorIfNotFound } from "@/exceptions";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/exceptions/errorClasses";
import { io } from "@/socket";
import {
  emitRefreshInventoryEvent,
  emitUpdateInventoryEvent,
} from "@/socket/inventoryEvent";
import { emitUpdateProductVariantEvent } from "@/socket/productEvent";
import {
  emitCreateSaleEvent,
  emitCreateSaleItemEvent,
} from "@/socket/saleEvent";
import {
  emitCompleteSaleOrderEvent,
  emitCreateSaleOrderEvent,
  emitCreateSaleOrderItemEvent,
  emitDeleteSaleOrderEvent,
  emitDeleteSaleOrderItemEvent,
  emitUpdateSaleOrderEvent,
  emitUpdateSaleOrderItemEvent,
} from "@/socket/saleOrderEvent";
import { PaginatedResponseIface } from "@/types";
import {
  createSaleOrderItemsSchema,
  createSaleOrderSchema,
  updateSaleOrderItemSchema,
} from "@/validationSchema/bodySchema/order/saleOrderSchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { SaleOrderQuerySchema } from "@/validationSchema/querySchema/order/saleOrderQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { In, Repository } from "typeorm";
import { BaseControllers } from "../baseControllers";

type CustomSaleOrderType = Omit<
  SaleOrder,
  "saleAgent" | "saleOrderItems" | "customer"
> & {
  saleAgent: Pick<User, "id" | "username" | "firstName" | "lastName" | "image">;
  customer: Pick<User, "id" | "username" | "firstName" | "lastName" | "image">;
} & {
  total_items: string;
  total_price: string;
  total_discounted: string;
};

export class SaleOrderControllers extends BaseControllers<SaleOrder> {
  private readonly saleOrderItemRepository: Repository<SaleOrderItem>;
  constructor() {
    super(SaleOrder);
    this.saleOrderItemRepository = AppDataSource.getRepository(SaleOrderItem);
    this.objectId = "saleOrderId";
  }

  static getUpdatedSaleOrderFieldById: (
    repo: Repository<SaleOrder>,
    id: string
  ) => Promise<{
    id: string;
    total_items: string;
    total_price: string;
    total_discounted: string;
  }> = async (repo: Repository<SaleOrder>, id: string) => {
    return await repo
      .createQueryBuilder("saleOrder")
      .leftJoin("saleOrder.saleOrderItems", "saleOrderItems")
      .select("saleOrder.id", "id")
      .addSelect("COALESCE(SUM(saleOrderItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM(saleOrderItems.price * saleOrderItems.quantity - saleOrderItems.discount),0)",
        "total_price"
      )
      .addSelect("COALESCE(SUM(saleOrderItems.discount),0)", "total_discounted")
      .where("saleOrder.id = :saleOrderId", {
        saleOrderId: id,
      })
      .groupBy("saleOrder.id")
      .getRawOne();
  };

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: BaseQuerySchema & SaleOrderQuerySchema = req.query as any;
    const queryBuilder = this.repository
      .createQueryBuilder("saleOrder")
      .withDeleted()
      .leftJoin("saleOrder.saleOrderItems", "saleOrderItems")
      .leftJoin("saleOrder.saleAgent", "saleAgent")
      .leftJoin("saleOrder.customer", "customer")
      .select("saleOrder")
      .addSelect("saleAgent")
      .addSelect("customer")
      .addSelect("COALESCE(SUM(saleOrderItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM(saleOrderItems.price * saleOrderItems.quantity - saleOrderItems.discount),0)",
        "total_price"
      )
      .addSelect("COALESCE(SUM(saleOrderItems.discount),0)", "total_discounted")
      .groupBy("saleOrder.id, saleAgent.id")
      .addGroupBy("customer.id")
      .orderBy("saleOrder.updatedAt", "DESC", "NULLS FIRST");

    if (req.user?.role == USER_ROLE.ADMIN) {
      if (query.saleAgentId) {
        queryBuilder.andWhere("saleOrder.saleAgent = :saleAgentId", {
          saleAgentId: query.saleAgentId,
        });
      }
    } else {
      queryBuilder.andWhere("saleOrder.saleAgent = :saleAgentId", {
        saleAgentId: req.user.id,
      });
    }

    if (query.from && query.to) {
      queryBuilder.andWhere("saleOrder.createdAt BETWEEN :from AND :to", {
        from: query.from,
        to: query.to,
      });
    }

    if (query.status) {
      queryBuilder.andWhere("saleOrder.status = :status", {
        status: query.status,
      });
    }

    const saleOrders = await queryBuilder
      .offset(query.offset)
      .limit(query.limit)
      .getRawMany();

    const total = await queryBuilder.getCount();
    const response: PaginatedResponseIface<CustomSaleOrderType> = {
      count: total,
      next: null,
      previous: null,
      results: saleOrders.map((saleOrder) => {
        return {
          id: saleOrder.saleOrder_id,
          status: saleOrder.saleOrder_status,
          completed: saleOrder.saleOrder_completed,
          type: saleOrder.saleOrder_type,
          createdAt: saleOrder.saleOrder_createdAt,
          updatedAt: saleOrder.saleOrder_updatedAt,
          customer: {
            id: saleOrder.customer_id,
            username: saleOrder.customer_username,
            firstName: saleOrder.customer_firstName,
            lastName: saleOrder.customer_lastName,
            image: saleOrder.customer_image,
          },
          saleAgent: {
            id: saleOrder.saleAgent_id,
            username: saleOrder.saleAgent_username,
            firstName: saleOrder.saleAgent_firstName,
            lastName: saleOrder.saleAgent_lastName,
            image: saleOrder.saleAgent_image,
          },
          total_items: saleOrder.total_items,
          total_price: saleOrder.total_price,
          total_discounted: saleOrder.total_discounted,
        };
      }),
    };
    res.status(200).json(response);
  };

  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await createSaleOrderSchema.validateAsync(req.body);
    /**
     * create sale saleOrder entity
     */
    const saleOrder = this.repository.create({
      saleAgent: req.user,
      customer: { id: validatedData.customerId },
    });
    /**
     * save sale saleOrder entity
     */
    const savedSaleOrder = await this.repository.save(saleOrder);
    /**
     * create saleOrder socket event
     */
    emitCreateSaleOrderEvent(io, [{ id: savedSaleOrder.id }]);
    /**
     * http response
     */
    res.status(201).json(savedSaleOrder);
  };

  destroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /** 1. transaction */
    const { saleOrder } = await AppDataSource.transaction(
      async (transactionManager) => {
        const saleOrderRepository = transactionManager.getRepository(SaleOrder);
        const inventoryRepository = transactionManager.getRepository(Inventory);
        /**
         * retrieve saleOrder with its saleOrderItems and saleAgent
         */
        const saleOrder = await throwErrorIfNotFound(saleOrderRepository, {
          relations: {
            saleAgent: true,
            saleOrderItems: {
              productVariant: {
                inventory: true,
              },
            },
          },
          where: {
            id: req.params[this.objectId],
          },
          withDeleted: true,
        });
        /**
         * if the sale order owner is deleted. admin can delete pending order.
         * else only owner can remove order.
         */
        if (saleOrder.saleAgent.deletedAt) {
          if (req.user.role != USER_ROLE.ADMIN) {
            throw new ForbiddenError();
          }
        } else if (saleOrder.saleAgent?.id !== req.user?.id) {
          throw new ForbiddenError();
        }
        /**
         * return the reserved sale order items to the store.
         */
        await inventoryRepository.save(
          saleOrder.saleOrderItems.map((saleOrderItem) => {
            saleOrderItem.productVariant.inventory.reserved -=
              saleOrderItem.quantity;
            saleOrderItem.productVariant.inventory.available +=
              saleOrderItem.quantity;
            return saleOrderItem.productVariant.inventory;
          })
        );
        /**
         * remove the saleOrder
         */
        await this.repository.delete({
          id: req.params[this.objectId],
        });
        return { saleOrder };
      }
    );
    /**
     * 2. post transaction
     */
    if (saleOrder) {
      /**
       * delete saleOrder socket event
       */
      emitDeleteSaleOrderEvent(io, [
        {
          id: req.params[this.objectId],
        },
      ]),
        /**
         * delete saleOrder item socket event
         */
        emitDeleteSaleOrderItemEvent(
          io,
          saleOrder.saleOrderItems.map((saleOrderItem) => ({
            id: saleOrderItem.id,
          }))
        ),
        /**
         * update inventory socket event
         */
        emitUpdateInventoryEvent(
          io,
          saleOrder.saleOrderItems.map((saleOrderItem) => ({
            id: saleOrderItem.productVariant.inventory.id,
            available: saleOrderItem.productVariant.inventory.available,
            reserved: saleOrderItem.productVariant.inventory.reserved,
          }))
        );
    }
    res.status(200).json(saleOrder);
  };

  completeSaleOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**
     * 1. validation - pre-transaction
     */
    const errorResponse: { id: string; detail: string }[] = [];
    /**
     * 2. transaction
     */
    const { saleOrder, savedSale, savedSaleItems } =
      await AppDataSource.transaction(async (transactionManager) => {
        const inventoryRepository = transactionManager.getRepository(Inventory);
        const saleRespository = transactionManager.getRepository(Sale);
        const saleItemRespository = transactionManager.getRepository(SaleItem);
        /**
         * get the saleOrder
         */
        const saleOrder = await throwErrorIfNotFound(
          transactionManager.getRepository(SaleOrder),
          {
            where: {
              id: req.params[this.objectId],
            },
            relations: {
              saleAgent: true,
              saleOrderItems: {
                productVariant: {
                  inventory: true,
                },
              },
            },
            withDeleted: true,
          }
        );

        if (saleOrder.saleAgent.id != req.user?.id) {
          throw new ForbiddenError();
        }

        if (!saleOrder.saleOrderItems.length) {
          throw new BadRequestError(
            "sale order cannot be completed as it has no items."
          );
        }
        /**
         * array of inventories for later to save.
         */
        const inventories: Inventory[] = [];
        /**
         * check if all sale order items have corresponing productVariant inventory information.
         */
        saleOrder.saleOrderItems.map((saleOrderItem) => {
          const inventory = saleOrderItem.productVariant.inventory;
          if (!inventory) {
            errorResponse.push({
              id: saleOrderItem.productVariant.id,
              detail: "stock not found",
            });
          }
          inventories.push(inventory);
          inventory.reserved -= saleOrderItem.quantity;
        });
        /**
         * check if there is error.
         */
        if (!errorResponse.length) {
          /**
           * real inventory update
           */
          await inventoryRepository.save(inventories);
          /**
           * create sale history
           */
          const savedSale = await saleRespository.save({
            saleAgent: req.user,
            customer: saleOrder.customer,
            saleOrder: saleOrder,
          });
          /**
           * save to database sale history
           */
          const savedSaleItems = await saleItemRespository.save(
            saleOrder.saleOrderItems.map((saleOrderItem) =>
              saleItemRespository.create({
                sale: savedSale,
                price: saleOrderItem.price,
                productVariant: saleOrderItem.productVariant,
                quantity: saleOrderItem.quantity,
                discount: saleOrderItem.discount,
                createdAt: saleOrderItem.createdAt,
                updatedAt: saleOrderItem.updatedAt,
              })
            )
          );
          /**
           * complete saleOrder and remove the order from sale order history
           */
          await transactionManager.getRepository(SaleOrder).remove(saleOrder);
          return {
            saleOrder,
            savedSale,
            savedSaleItems,
          };
        }
        return {};
      });
    /**
     * 2. post transaction
     */
    /**
     * complete sale order socket event
     */
    emitCompleteSaleOrderEvent(io, [{ id: req.params[this.objectId] }]);
    /**
     * delete saleOrder items socket event
     */
    emitDeleteSaleOrderItemEvent(
      io,
      saleOrder.saleOrderItems.map((saleOrderItem) => ({
        id: saleOrderItem.id,
      }))
    );
    /**
     * update product-variant socket event
     */
    emitUpdateProductVariantEvent(
      io,
      saleOrder.saleOrderItems.map((saleOrderItem) => ({
        id: saleOrderItem.productVariant.id,
        inventory: {
          id: saleOrderItem.productVariant.inventory.id,
          available: saleOrderItem.productVariant.inventory.available,
          reserved: saleOrderItem.productVariant.inventory.reserved,
        },
      }))
    );

    if (saleOrder) {
      /**
       * update inventory socket event
       */
      emitUpdateInventoryEvent(
        io,
        saleOrder.saleOrderItems.map(
          (saleOrderItem) => saleOrderItem.productVariant.inventory
        )
      );
    }
    if (savedSale) {
      /**
       * create sale socket event
       */
      emitCreateSaleEvent(io, [{ id: savedSale.id }]);
    }
    if (savedSaleItems) {
      /**
       * create sale-item socket event
       */
      emitCreateSaleItemEvent(
        io,
        savedSaleItems.map((saleItem) => ({ id: saleItem.id }))
      );
    }
    if (errorResponse.length) {
      throw new BadRequestError("Validation Failed", errorResponse);
    }
    res.status(200).json({ detail: "successfully completed" });
  };

  calculateSaleOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryBuilder = this.repository
      .createQueryBuilder("saleOrder")
      .leftJoin("saleOrder.saleOrderItems", "saleOrderItems")
      .addSelect("COALESCE(SUM(saleOrderItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM(saleOrderItems.price * saleOrderItems.quantity - saleOrderItems.discount),0)",
        "total_price"
      )
      .addSelect("COALESCE(SUM(saleOrderItems.discount),0)", "total_discounted")
      .where({ id: req.params[this.objectId] })
      .groupBy("saleOrder.id");
    const info = await queryBuilder.getRawOne();
    if (info) {
      res.status(200).json(info);
    } else {
      throw new NotFoundError();
    }
  };

  listSaleOrderItems: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema = req.query as any;
    const [saleOrderItems, total] =
      await this.saleOrderItemRepository.findAndCount({
        where: {
          saleOrder: { id: req.params[this.objectId] },
        },
        relations: {
          productVariant: {
            images: true,
          },
        },
        withDeleted: true,
        skip: queryParams.offset,
        take: queryParams.limit,
      });

    const response: PaginatedResponseIface<SaleOrderItem> = {
      count: total,
      next: null,
      previous: null,
      results: saleOrderItems,
    };
    res.status(200).json(response);
  };

  createSaleOrderItems: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await createSaleOrderItemsSchema.validateAsync(
      req.body
    );
    const errorResponse: {
      id: string;
      productVariant: ProductVariant | null;
      detail: string;
      errorType: "NotFoundError" | "StockError" | "DiscountError";
    }[] = [];
    const rawSaleOrderItems: Pick<
      SaleOrderItem,
      "productVariant" | "quantity" | "discount" | "price" | "saleOrder"
    >[] = [];
    /**
     * check if we get at least on product
     */
    if (validatedData.length == 0) {
      throw new BadRequestError("No data provided");
    }
    /**
     * start transaction
     */
    const { savedInventories, savedSaleOrderItems, updatedSaleOrder } =
      await AppDataSource.transaction(async (transactionManager) => {
        // get the saleOrder
        const saleOrder = await throwErrorIfNotFound(
          transactionManager.getRepository(SaleOrder),
          {
            where: {
              id: req.params[this.objectId],
            },
            relations: {
              saleAgent: true,
            },
            withDeleted: true,
          }
        );
        // user is owner of the saleOrder
        if (saleOrder.saleAgent?.id !== req.user?.id) {
          throw new ForbiddenError();
        }
        // get all product-variant's inventory status
        const inventories = await transactionManager.find(Inventory, {
          where: {
            productVariant: {
              id: In(validatedData.map((item) => item.productVariant)),
            },
          },
          relations: {
            productVariant: true,
          },
        });
        // all product-variants are in the inventory
        if (inventories.length != validatedData.length) {
          validatedData.map((validated) => {
            const info = inventories.find(
              (inventory) =>
                inventory.productVariant.id == validated.productVariant
            );
            if (!info) {
              errorResponse.push({
                errorType: "NotFoundError",
                id: validated.productVariant,
                productVariant: null,
                detail: "Oops! We couldn't find what you're looking for.",
              });
            }
          });
          /**
           * throw bad request error
           */
          throw new BadRequestError("Validation Error", errorResponse);
        }

        validatedData.map((rawData) => {
          const inventory = inventories.find(
            (inventory) => inventory.productVariant.id == rawData.productVariant
          );
          // for next during save to the SaleOrderItem
          rawSaleOrderItems.push({
            productVariant: inventory.productVariant,
            quantity: rawData.quantity,
            saleOrder: saleOrder,
            price: inventory.productVariant.price,
            discount: rawData.discount,
          });

          if (inventory.available < rawData.quantity) {
            errorResponse.push({
              id: rawData.productVariant,
              errorType: "NotFoundError",
              productVariant: inventory.productVariant,
              detail: "Out of stock",
            });
          } else {
            inventory.available -= rawData.quantity;
            inventory.reserved += rawData.quantity;
            /**
             * check if the discount mount is valid
             */
            if (
              inventory.productVariant.price * rawData.quantity <
              rawData.discount
            ) {
              errorResponse.push({
                id: rawData.productVariant,
                errorType: "DiscountError",
                productVariant: inventory.productVariant,
                detail: "sorry! discount should be less than the product price",
              });
            }
          }
        });

        if (!errorResponse.length) {
          /**
           * save saleOrder items
           */
          const savedSaleOrderItems = await transactionManager
            .getRepository(SaleOrderItem)
            .save(rawSaleOrderItems);
          /**
           * update the inventory system
           */
          const savedInventories = await transactionManager
            .getRepository(Inventory)
            .save(inventories);

          /**
           * get the changed attributes of saleOrder
           */
          const updatedSaleOrder =
            await SaleOrderControllers.getUpdatedSaleOrderFieldById(
              transactionManager.getRepository(SaleOrder),
              saleOrder.id
            );

          return {
            savedInventories,
            updatedSaleOrder,
            savedSaleOrderItems,
          };
        }
        return {};
      });
    /**
     * throw bad request error
     */
    if (errorResponse.length) {
      throw new BadRequestError("Validation Error", errorResponse);
    }
    /**
     * emit socket events
     */
    if (savedInventories && savedSaleOrderItems && updatedSaleOrder) {
      /**
       * create saleOrder-item socket event
       */
      emitCreateSaleOrderItemEvent(
        io,
        savedSaleOrderItems.map((saleOrderItem) => ({
          id: saleOrderItem.id,
        }))
      );
      /**
       * update saleOrder socket event
       */
      emitUpdateSaleOrderEvent(io, [updatedSaleOrder]);
      /**
       * update product-variant socket event
       */
      emitUpdateProductVariantEvent(
        io,
        savedInventories.map((inventory) => ({
          id: inventory.productVariant.id,
          inventory: {
            id: inventory.id,
            available: inventory.available,
            reserved: inventory.reserved,
          },
        }))
      );
      /**
       * refresh inventory socket event
       */
      emitRefreshInventoryEvent(io);
    }

    res.status(201).json({
      detail: "successfully created!",
    });
  };

  updateSaleOrderItem: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await updateSaleOrderItemSchema.validateAsync(
      req.body
    );
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const inventoryRepository = transactionManager.getRepository(Inventory);
        const saleOrderItemRepository =
          transactionManager.getRepository(SaleOrderItem);
        /**
         * find the active sale order item
         */
        const saleOrderItem = await throwErrorIfNotFound(
          saleOrderItemRepository,
          {
            where: {
              id: req.params["saleOrderItemId"],
              saleOrder: {
                id: req.params[this.objectId],
              },
            },
            // lock: { mode: "pessimistic_write" },
            relations: {
              saleOrder: {
                saleAgent: true,
              },
              productVariant: {
                inventory: true,
              },
            },
            withDeleted: true,
          }
        );

        // check the user is owner of the saleOrder
        if (saleOrderItem.saleOrder.saleAgent?.id !== req.user?.id) {
          throw new ForbiddenError();
        }

        const change = Math.abs(
          saleOrderItem.quantity - validatedData.quantity
        );
        const isDecreasing = saleOrderItem.quantity > validatedData.quantity;
        if (isDecreasing) {
          saleOrderItem.productVariant.inventory.available += change;
          saleOrderItem.productVariant.inventory.reserved -= change;
        } else {
          if (saleOrderItem.productVariant.inventory.available >= change) {
            saleOrderItem.productVariant.inventory.available -= change;
            saleOrderItem.productVariant.inventory.reserved += change;
          } else {
            throw new BadRequestError("sorry! you do not have enough stock", {
              available: saleOrderItem.productVariant.inventory.available,
            });
          }
        }
        /**
         * update the quantity
         */
        saleOrderItem.quantity = validatedData.quantity;
        /**
         * the discount amount is valid
         */
        if (
          validatedData.discount >=
          saleOrderItem.price * saleOrderItem.quantity
        ) {
          throw new BadRequestError(
            "sorry! discount should be less than the product price",
            {
              available: saleOrderItem.productVariant.inventory.available,
            }
          );
        }
        /**
         * update discount
         */
        saleOrderItem.discount = validatedData.discount;
        /**
         * save change to database
         */
        await inventoryRepository.save(saleOrderItem.productVariant.inventory);
        const savedSaleOrderItem = await saleOrderItemRepository.save(
          saleOrderItem
        );
        /**
         * update saleOrder-item socket event
         */
        emitUpdateSaleOrderItemEvent(io, [
          {
            id: savedSaleOrderItem.id,
            quantity: savedSaleOrderItem.quantity,
            discount: savedSaleOrderItem.discount,
            productVariant: {
              id: savedSaleOrderItem.productVariant.id,
              inventory: {
                id: savedSaleOrderItem.productVariant.inventory.id,
                available:
                  savedSaleOrderItem.productVariant.inventory.available,
                reserved: savedSaleOrderItem.productVariant.inventory.reserved,
              },
            },
          },
        ]);
        /**
         * update product-variant socket event
         */
        emitUpdateProductVariantEvent(io, [
          {
            id: savedSaleOrderItem.productVariant.id,
            inventory: {
              id: savedSaleOrderItem.productVariant.inventory.id,
              available: savedSaleOrderItem.productVariant.inventory.available,
              reserved: savedSaleOrderItem.productVariant.inventory.reserved,
            },
          },
        ]);
        /**
         * get the changed attributes of saleOrder
         */
        const updatedSaleOrder =
          await SaleOrderControllers.getUpdatedSaleOrderFieldById(
            transactionManager.getRepository(SaleOrder),
            req.params[this.objectId]
          );
        /**
         * update saleOrder socket event
         */
        emitUpdateSaleOrderEvent(io, [updatedSaleOrder]);
        /**
         * refresh inventory socket event
         */
        emitRefreshInventoryEvent(io);
        res.status(200).json({ detail: "successfully updated" });
      } catch (err) {
        next(err);
      }
    });
  };

  destroySaleOrderItem: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const inventoryRepository = transactionManager.getRepository(Inventory);
        const saleOrderItemRepository =
          transactionManager.getRepository(SaleOrderItem);
        /**
         * get the saleOrder-item with its relations
         */
        const saleOrderItem = await throwErrorIfNotFound(
          saleOrderItemRepository,
          {
            where: {
              id: req.params["saleOrderItemId"],
              saleOrder: {
                id: req.params[this.objectId],
              },
            },
            relations: {
              saleOrder: {
                saleAgent: true,
              },
              productVariant: {
                inventory: true,
              },
            },
            withDeleted: true,
          }
        );
        /**
         * check if the owner of the saleOrder is the same as the user
         */
        if (req.user.id != saleOrderItem.saleOrder.saleAgent.id) {
          throw new ForbiddenError();
        }
        /**
         * return stock to store.
         */
        saleOrderItem.productVariant.inventory.reserved -=
          saleOrderItem.quantity;
        saleOrderItem.productVariant.inventory.available +=
          saleOrderItem.quantity;
        /**
         * save returned products
         */
        const savedInventory = await inventoryRepository.save(
          saleOrderItem.productVariant.inventory
        );
        /**
         * remove the saleOrder Item from database
         */
        await saleOrderItemRepository.remove(saleOrderItem);
        /**
         * delete saleOrder-item socket event
         */
        emitDeleteSaleOrderItemEvent(io, [
          {
            id: req.params["saleOrderItemId"],
          },
        ]);
        /**
         * get the changed attributes of saleOrder
         */
        const updatedSaleOrder =
          await SaleOrderControllers.getUpdatedSaleOrderFieldById(
            transactionManager.getRepository(SaleOrder),
            req.params[this.objectId]
          );
        /**
         * update saleOrder socket event
         */
        emitUpdateSaleOrderEvent(io, [updatedSaleOrder]);
        /**
         * update product-variant socket event
         */
        emitUpdateProductVariantEvent(io, [
          {
            id: saleOrderItem.productVariant.id,
            inventory: {
              id: savedInventory.id,
              available: savedInventory.available,
              reserved: savedInventory.reserved,
            },
          },
        ]);
        /**
         * refresh inventory socket event
         */
        emitRefreshInventoryEvent(io);
        res.status(204).json();
      } catch (error) {
        next(error);
      }
    });
  };
}
