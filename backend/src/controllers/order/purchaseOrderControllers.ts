import { AppDataSource } from "@/data-source";
import { Inventory } from "@/entity/Inventory";
import { PurchaseOrder } from "@/entity/order/PurchaseOrder";
import { PurchaseOrderItem } from "@/entity/order/PurchaseOrderItem";
import { ProductVariant } from "@/entity/product/ProductVariant";
import { Purchase } from "@/entity/Purchase";
import { PurchaseItem } from "@/entity/PurchaseItem";
import { Supplier } from "@/entity/Supplier";
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
  emitCreatePurchaseEvent,
  emitCreatePurchaseItemEvent,
} from "@/socket/purchaseEvent";
import {
  emitCompletePurchaseOrderEvent,
  emitCreatePurchaseOrderEvent,
  emitCreatePurchaseOrderItemEvent,
  emitDeletePurchaseOrderEvent,
  emitDeletePurchaseOrderItemEvent,
  emitUpdatePurchaseOrderEvent,
  emitUpdatePurchaseOrderItemEvent,
} from "@/socket/purchaseOrderEvent";
import { PaginatedResponseIface } from "@/types";
import {
  createPurchaseOrderItemsSchema,
  updatePurchaseOrderItemSchema,
} from "@/validationSchema/bodySchema/order/purchaseOrderSchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { PurchaseOrderQuerySchema } from "@/validationSchema/querySchema/order/purchaseOrderQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { In, Repository } from "typeorm";
import { BaseControllers } from "../baseControllers";

type CustomPurchaseOrderType = Omit<
  PurchaseOrder,
  "purchaseAgent" | "supplier" | "purchaseOrderItems"
> & {
  purchaseAgent: Pick<
    User,
    "id" | "username" | "firstName" | "lastName" | "image"
  >;
} & {
  supplier: Pick<Supplier, "id" | "name" | "supplierType" | "contactEmail">;
} & {
  total_items: string;
  total_price: string;
};

export class PurchaseOrderControllers extends BaseControllers<PurchaseOrder> {
  private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>;
  constructor() {
    super(PurchaseOrder);
    this.purchaseOrderItemRepository =
      AppDataSource.getRepository(PurchaseOrderItem);
    this.objectId = "purchaseOrderId";
  }

  static getUpdatedPurchaseOrderFieldById: (
    repo: Repository<PurchaseOrder>,
    id: string
  ) => Promise<{
    id: string;
    total_items: string;
    total_price: string;
  }> = async (repo: Repository<PurchaseOrder>, id: string) => {
    return await repo
      .createQueryBuilder("purchaseOrder")
      .leftJoin("purchaseOrder.purchaseOrderItems", "purchaseOrderItems")
      .select("purchaseOrder.id", "id")
      .addSelect("COALESCE(SUM(purchaseOrderItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM(purchaseOrderItems.price * purchaseOrderItems.quantity),0)",
        "total_price"
      )
      .where("purchaseOrder.id = :purchaseOrderId", {
        purchaseOrderId: id,
      })
      .groupBy("purchaseOrder.id")
      .getRawOne();
  };

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: BaseQuerySchema & PurchaseOrderQuerySchema = req.query as any;
    const queryBuilder = this.repository
      .createQueryBuilder("purchaseOrder")
      .withDeleted()
      .leftJoin("purchaseOrder.purchaseOrderItems", "purchaseOrderItems")
      .leftJoin("purchaseOrder.purchaseAgent", "purchaseAgent")
      .leftJoin("purchaseOrder.supplier", "supplier")
      .select("purchaseOrder")
      .addSelect("purchaseAgent")
      .addSelect("supplier")
      .addSelect("COALESCE(SUM(purchaseOrderItems.quantity), 0)", "total_items")
      .addSelect(
        "COALESCE(SUM(purchaseOrderItems.price * purchaseOrderItems.quantity),0)",
        "total_price"
      )
      .groupBy("purchaseOrder.id, purchaseAgent.id")
      .addGroupBy("supplier.id")
      .orderBy("purchaseOrder.updatedAt", "DESC", "NULLS FIRST");

    if (req.user?.role == USER_ROLE.ADMIN) {
      if (query.purchaseAgentId) {
        queryBuilder.andWhere(
          "purchaseOrder.purchaseAgent = :purchaseAgentId",
          {
            purchaseAgentId: query.purchaseAgentId,
          }
        );
      }
    } else {
      queryBuilder.andWhere("purchaseOrder.purchaseAgent = :purchaseAgentId", {
        purchaseAgentId: req.user.id,
      });
    }

    if (query.from && query.to) {
      queryBuilder.andWhere("purchaseOrder.createdAt BETWEEN :from AND :to", {
        from: query.from,
        to: query.to,
      });
    }

    if (query.status) {
      queryBuilder.andWhere("purchaseOrder.status = :status", {
        status: query.status,
      });
    }

    const purchaseOrders = await queryBuilder
      .offset(query.offset)
      .limit(query.limit)
      .getRawMany();

    const total = await queryBuilder.getCount();
    const response: PaginatedResponseIface<CustomPurchaseOrderType> = {
      count: total,
      next: null,
      previous: null,
      results: purchaseOrders.map((purchaseOrder) => {
        return {
          id: purchaseOrder.purchaseOrder_id,
          status: purchaseOrder.purchaseOrder_status,
          completed: purchaseOrder.purchaseOrder_completed,
          type: purchaseOrder.purchaseOrder_type,
          createdAt: purchaseOrder.purchaseOrder_createdAt,
          updatedAt: purchaseOrder.purchaseOrder_updatedAt,
          supplier: {
            id: purchaseOrder.supplier_id,
            name: purchaseOrder.supplier_name,
            supplierType: purchaseOrder.supplier_supplierType,
            contactEmail: purchaseOrder.supplier_contactEmail,
          },
          purchaseAgent: {
            id: purchaseOrder.purchaseAgent_id,
            username: purchaseOrder.purchaseAgent_username,
            firstName: purchaseOrder.purchaseAgent_firstName,
            lastName: purchaseOrder.purchaseAgent_lastName,
            image: purchaseOrder.purchaseAgent_image,
          },
          total_items: purchaseOrder.total_items,
          total_price: purchaseOrder.total_price,
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
    /**
     * create purchaseOrder entity
     */
    const purchaseOrder = this.repository.create({
      purchaseAgent: req.user,
    });
    /**
     * save purchaseOrder entity
     */
    const savedPurchaseOrder = await this.repository.save(purchaseOrder);
    /**
     * create purchaseOrder socket event
     */
    emitCreatePurchaseOrderEvent(io, [
      {
        id: savedPurchaseOrder.id,
      },
    ]);
    /**
     * http response
     */
    res.status(201).json(savedPurchaseOrder);
  };

  destroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const purchaseOrderRepository =
          transactionManager.getRepository(PurchaseOrder);
        const inventoryRepository = transactionManager.getRepository(Inventory);
        /**
         * retrieve purchaseOrder with its purchaseOrderItems and purchaseAgent
         */
        const purchaseOrder = await throwErrorIfNotFound(
          purchaseOrderRepository,
          {
            relations: {
              purchaseAgent: true,
              purchaseOrderItems: {
                productVariant: {
                  inventory: true,
                },
              },
            },
            where: {
              id: req.params[this.objectId],
            },
            withDeleted: true,
          }
        );
        /**
         * if the sale order owner is deleted. admin can delete pending order.
         * else only owner can remove order.
         */
        if (purchaseOrder.purchaseAgent.deletedAt) {
          if (req.user.role != USER_ROLE.ADMIN) {
            throw new ForbiddenError();
          }
        } else if (purchaseOrder.purchaseAgent?.id !== req.user?.id) {
          throw new ForbiddenError();
        }
        /**
         * return the reserved purchase order items to the store.
         */
        await inventoryRepository.save(
          purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) => {
            const inventory = purchaseOrderItem.productVariant.inventory;
            inventory.reserved -= purchaseOrderItem.quantity;
            return inventory;
          })
        );
        /**
         * remove the purchaseOrder
         */
        await this.repository.delete({
          id: req.params[this.objectId],
        });
        /**
         * delete purchaseOrder item socket event
         */
        emitDeletePurchaseOrderEvent(io, [
          {
            id: req.params[this.objectId],
          },
        ]);
        /**
         * delete purchaseOrder item socket event
         */
        emitDeletePurchaseOrderItemEvent(
          io,
          purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) => ({
            id: purchaseOrderItem.id,
          }))
        );
        /**
         * update inventory socket event
         */
        emitUpdateInventoryEvent(
          io,
          purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) => ({
            id: purchaseOrderItem.productVariant.inventory.id,
            available: purchaseOrderItem.productVariant.inventory.available,
            reserved: purchaseOrderItem.productVariant.inventory.reserved,
          }))
        );
        /**
         * update product-variant socket event
         */
        emitUpdateProductVariantEvent(
          io,
          purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) => ({
            id: purchaseOrderItem.productVariant.id,
            inventory: {
              id: purchaseOrderItem.productVariant.inventory.id,
              available: purchaseOrderItem.productVariant.inventory.available,
              reserved: purchaseOrderItem.productVariant.inventory.reserved,
            },
          }))
        );
        /**
         * http response
         */
        res.status(200).json(purchaseOrder);
      } catch (error) {
        next(error);
      }
    });
  };

  completePurchaseOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errorResponse: { id: string; detail: string }[] = [];
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const inventoryRepository = transactionManager.getRepository(Inventory);
        const purchaseRepository = transactionManager.getRepository(Purchase);
        const purchaseItemRespository =
          transactionManager.getRepository(PurchaseItem);
        /**
         * get the purchaseOrder
         */
        const purchaseOrder = await throwErrorIfNotFound(
          transactionManager.getRepository(PurchaseOrder),
          {
            where: {
              id: req.params[this.objectId],
            },
            relations: {
              purchaseAgent: true,
              purchaseOrderItems: {
                productVariant: {
                  inventory: true,
                },
              },
            },
            withDeleted: true,
          }
        );

        if (purchaseOrder.purchaseAgent.id != req.user.id) {
          throw new ForbiddenError();
        }

        if (!purchaseOrder.purchaseOrderItems.length) {
          throw new BadRequestError(
            "PurchaseOrder cannot be completed as it has no items."
          );
        }
        /**
         * array of inventories for later to save.
         */
        const inventories: Inventory[] = [];
        /**
         * check if all sale order items have corresponing productVariant inventory information.
         */
        purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) => {
          const inventory = purchaseOrderItem.productVariant.inventory;
          if (!inventory) {
            errorResponse.push({
              id: purchaseOrderItem.productVariant.id,
              detail: "stock not found",
            });
          }
          inventories.push(inventory);
          inventory.reserved -= purchaseOrderItem.quantity;
          inventory.available += purchaseOrderItem.quantity;
        });
        /**
         * check if there is error.
         */
        if (!errorResponse.length) {
          /**real inventory update */
          await inventoryRepository.save(inventories);
          /**create sale or purchase */
          const savedPurchase = await purchaseRepository.save({
            purchaseAgent: req.user,
            purchaseOrder,
            // supplier: purchaseOrder.supplier,
          });
          const savedPurchaseItems = await purchaseItemRespository.save(
            purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) =>
              purchaseItemRespository.create({
                purchase: savedPurchase,
                price: purchaseOrderItem.price,
                productVariant: purchaseOrderItem.productVariant,
                quantity: purchaseOrderItem.quantity,
              })
            )
          );
          /**
           * complete purchaseOrder
           */
          await transactionManager
            .getRepository(PurchaseOrder)
            .remove(purchaseOrder);

          /**
           * complete purchaseOrder socket event
           */
          emitCompletePurchaseOrderEvent(io, [
            { id: req.params[this.objectId] },
          ]);
          /**
           * delete purchaseOrder items socket event
           */
          emitDeletePurchaseOrderItemEvent(
            io,
            purchaseOrder.purchaseOrderItems.map((purchaseOrderItem) => ({
              id: purchaseOrderItem.id,
            }))
          );
          /**
           * update product-variant socket event
           */
          emitUpdateProductVariantEvent(
            io,
            purchaseOrder.purchaseOrderItems.map(
              (purchaseOrderItem) => purchaseOrderItem.productVariant
            )
          );
          /**
           * update inventory socket event
           */
          emitUpdateInventoryEvent(
            io,
            purchaseOrder.purchaseOrderItems.map(
              (purchaseOrderItem) => purchaseOrderItem.productVariant.inventory
            )
          );
          /**
           * create sale socket event
           */
          emitCreatePurchaseEvent(io, [{ id: savedPurchase.id }]);
          /**
           * create purchase-item socket event
           */
          emitCreatePurchaseItemEvent(
            io,
            savedPurchaseItems.map((purchaseItem) => ({ id: purchaseItem.id }))
          );
          /**
           * http response
           */
          res.status(200).json({ detail: "successfully completed" });
        } else {
          res.status(400).json(errorResponse);
          return;
        }
      } catch (error) {
        next(error);
      }
    });
  };

  calculatePurchaseOrder: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryBuilder = this.repository
      .createQueryBuilder("purchaseOrder")
      .leftJoin("purchaseOrder.purchaseOrderItems", "purchaseOrderItems")
      .select(
        "COALESCE(SUM(purchaseOrderItems.price * purchaseOrderItems.quantity),0)",
        "total_price"
      )
      .addSelect("COALESCE(SUM(purchaseOrderItems.quantity),0)", "total_items")
      .where({ id: req.params[this.objectId] })
      .groupBy("purchaseOrder.id");
    const info = await queryBuilder.getRawOne();
    if (info) {
      res.status(200).json(info);
    } else {
      throw new NotFoundError();
    }
  };

  listPurchaseOrderItems: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema = req.query as any;
    const [purchaseOrderItems, total] =
      await this.purchaseOrderItemRepository.findAndCount({
        where: {
          purchaseOrder: { id: req.params[this.objectId] },
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

    const response: PaginatedResponseIface<any> = {
      count: total,
      next: null,
      previous: null,
      results: purchaseOrderItems,
    };
    res.status(200).json(response);
  };

  createPurchaseOrderItems: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await createPurchaseOrderItemsSchema.validateAsync(
      req.body
    );
    const errorResponse: {
      id: string;
      productVariant: ProductVariant | null;
      detail: string;
      errorType: "NotFoundError" | "StockError";
    }[] = [];
    const rawPurchaseOrderItems: {
      productVariant: ProductVariant;
      quantity: number;
      purchaseOrder: PurchaseOrder;
      price: number;
    }[] = [];

    if (validatedData.length == 0) {
      throw new BadRequestError("No data provided");
    }

    // start transaction
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        // get the purchaseOrder
        const purchaseOrder = await throwErrorIfNotFound(
          transactionManager.getRepository(PurchaseOrder),
          {
            where: {
              id: req.params[this.objectId],
            },
            relations: {
              purchaseAgent: true,
            },
            withDeleted: true,
          }
        );
        // user is owner of the purchaseOrder
        if (purchaseOrder.purchaseAgent?.id !== req.user?.id) {
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
          validatedData.reduce((acc, item) => {
            const info = inventories.find(
              (inventory) => inventory.productVariant.id == item.productVariant
            );
            if (!info) {
              acc.push({
                errorType: "NotFoundError",
                id: item.productVariant,
                productVariant: null,
                detail: "Not Found",
              });
            }
            return acc;
          }, errorResponse);
          /**
           * throw bad request error
           */
          throw new BadRequestError("Validation Error", errorResponse);
        }

        validatedData.map((rawData) => {
          const inventory = inventories.find(
            (inventory) => inventory.productVariant.id == rawData.productVariant
          );
          // for next during save to the PurchaseOrderItem
          rawPurchaseOrderItems.push({
            productVariant: inventory.productVariant,
            quantity: rawData.quantity,
            purchaseOrder: purchaseOrder,
            price: rawData.price,
          });
          inventory.reserved += rawData.quantity;
        });

        if (errorResponse.length) {
          /**
           * throw bad request error
           */
          throw new BadRequestError("Validation Error", errorResponse);
        } else {
          // save purchaseOrder items
          const savedPurchaseOrderItems = await transactionManager
            .getRepository(PurchaseOrderItem)
            .save(rawPurchaseOrderItems);
          // update the inventory system
          const savedInventories = await transactionManager
            .getRepository(Inventory)
            .save(inventories);
          /**
           * create purchaseOrder-item socket event
           */
          emitCreatePurchaseOrderItemEvent(
            io,
            savedPurchaseOrderItems.map((purchaseOrderItem) => ({
              id: purchaseOrderItem.id,
            }))
          );
          /**
           * get the changed attributes of purchaseOrder
           */
          const updatedPurchaseOrder =
            await PurchaseOrderControllers.getUpdatedPurchaseOrderFieldById(
              transactionManager.getRepository(PurchaseOrder),
              purchaseOrder.id
            );
          /**
           * update purchaseOrder socket event
           */
          emitUpdatePurchaseOrderEvent(io, [updatedPurchaseOrder]);
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
          res.status(201).json({
            detail: "successfully created!",
          });
        }
      } catch (e) {
        next(e);
      }
    });
  };

  updatePurchaseOrderItem: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      const inventoryRepository = transactionManager.getRepository(Inventory);
      const purchaseOrderItemRepository =
        transactionManager.getRepository(PurchaseOrderItem);
      try {
        const purchaseOrderItem = await throwErrorIfNotFound(
          purchaseOrderItemRepository,
          {
            where: {
              id: req.params["purchaseOrderItemId"],
              purchaseOrder: {
                id: req.params[this.objectId],
              },
            },
            // lock: { mode: "pessimistic_write" },
            relations: {
              purchaseOrder: {
                purchaseAgent: true,
              },
              productVariant: {
                inventory: true,
              },
            },
            withDeleted: true,
          }
        );
        const validatedData = await updatePurchaseOrderItemSchema.validateAsync(
          req.body
        );

        // check the user is owner of the purchaseOrder
        if (
          purchaseOrderItem.purchaseOrder.purchaseAgent?.id !== req.user?.id
        ) {
          throw new ForbiddenError();
        }

        const change = Math.abs(
          purchaseOrderItem.quantity - validatedData.quantity
        );
        const isDecreasing =
          purchaseOrderItem.quantity > validatedData.quantity;
        if (isDecreasing) {
          purchaseOrderItem.productVariant.inventory.reserved -= change;
          purchaseOrderItem.quantity -= change;
        } else {
          purchaseOrderItem.productVariant.inventory.reserved += change;
          purchaseOrderItem.quantity += change;
        }
        /**
         * update the price of purchase purchaseOrder
         */
        purchaseOrderItem.price = validatedData.price;
        /**
         * save change to database
         */
        await inventoryRepository.save(
          purchaseOrderItem.productVariant.inventory
        );
        const savedPurchaseOrderItem = await purchaseOrderItemRepository.save(
          purchaseOrderItem
        );
        /**
         * update purchaseOrder-item socket event
         */
        emitUpdatePurchaseOrderItemEvent(io, [
          {
            id: savedPurchaseOrderItem.id,
            quantity: savedPurchaseOrderItem.quantity,
            price: savedPurchaseOrderItem.price,
            productVariant: {
              id: savedPurchaseOrderItem.productVariant.id,
              inventory: {
                id: savedPurchaseOrderItem.productVariant.inventory.id,
                available:
                  savedPurchaseOrderItem.productVariant.inventory.available,
                reserved:
                  savedPurchaseOrderItem.productVariant.inventory.reserved,
              },
            },
          },
        ]);
        /**
         * update product-variant socket event
         */
        emitUpdateProductVariantEvent(io, [
          {
            id: savedPurchaseOrderItem.productVariant.id,
            inventory: {
              id: savedPurchaseOrderItem.productVariant.inventory.id,
              available:
                savedPurchaseOrderItem.productVariant.inventory.available,
              reserved:
                savedPurchaseOrderItem.productVariant.inventory.reserved,
            },
          },
        ]);
        /**
         * get the changed attributes of purchaseOrder
         */
        const purchaseOrderInfo = await transactionManager
          .getRepository(PurchaseOrder)
          .createQueryBuilder("purchaseOrder")
          .leftJoin("purchaseOrder.purchaseOrderItems", "purchaseOrderItems")
          .select("purchaseOrder.id", "id")
          .addSelect(
            "COALESCE(SUM(purchaseOrderItems.quantity),0)",
            "total_items"
          )
          .addSelect(
            "COALESCE(SUM(purchaseOrderItems.price * purchaseOrderItems.quantity),0)",
            "total_price"
          )
          .where("purchaseOrder.id = :purchaseOrderId", {
            purchaseOrderId: req.params[this.objectId],
          })
          .groupBy("purchaseOrder.id")
          .getRawOne();
        /**
         * update purchaseOrder socket event
         */
        emitUpdatePurchaseOrderEvent(io, [purchaseOrderInfo]);
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

  destroyPurchaseOrderItem: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const inventoryRepository = transactionManager.getRepository(Inventory);
        const purchaseOrderItemRepository =
          transactionManager.getRepository(PurchaseOrderItem);
        /**
         * get the purchaseOrder-item with its relations
         */
        const purchaseOrderItem = await throwErrorIfNotFound(
          purchaseOrderItemRepository,
          {
            where: {
              id: req.params["purchaseOrderItemId"],
              purchaseOrder: {
                id: req.params[this.objectId],
              },
            },
            relations: {
              purchaseOrder: {
                purchaseAgent: true,
              },
              productVariant: {
                inventory: true,
              },
            },
            withDeleted: true,
          }
        );
        /**
         * check if the owner of the purchaseOrder is the same as the user
         */
        if (req.user.id != purchaseOrderItem.purchaseOrder.purchaseAgent.id) {
          throw new ForbiddenError();
        }
        /**
         * return stock to the owner.
         */
        purchaseOrderItem.productVariant.inventory.reserved -=
          purchaseOrderItem.quantity;
        /**
         * save returned products
         */
        const savedInventory = await inventoryRepository.save(
          purchaseOrderItem.productVariant.inventory
        );
        /**
         * remove the purchaseOrder Item from database
         */
        await purchaseOrderItemRepository.remove(purchaseOrderItem);
        /**
         * delete purchaseOrder-item socket event
         */
        emitDeletePurchaseOrderItemEvent(io, [
          {
            id: req.params["purchaseOrderItemId"],
          },
        ]);
        /**
         * get the changed attributes of purchaseOrder
         */
        const updatedPurchaseOrder =
          await PurchaseOrderControllers.getUpdatedPurchaseOrderFieldById(
            transactionManager.getRepository(PurchaseOrder),
            req.params[this.objectId]
          );
        /**
         * update purchaseOrder socket event
         */
        emitUpdatePurchaseOrderEvent(io, [updatedPurchaseOrder]);
        /**
         * update product-variant socket event
         */
        emitUpdateProductVariantEvent(io, [
          {
            id: purchaseOrderItem.productVariant.id,
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
