import AppDataSource from "@/data-source";
import { Inventory } from "@/entity/Inventory";
import { ProductVariant } from "@/entity/product/ProductVariant";
import { Sale } from "@/entity/Sale";
import { SaleItem } from "@/entity/SaleItem";
import {
  ReturnReason,
  SALE_RETURN_STATUS,
  SaleItemReturn,
} from "@/entity/SaleItemReturn";
import { throwErrorIfNotFound } from "@/exceptions";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/exceptions/errorClasses";
import { io } from "@/socket";
import { emitUpdateInventoryEvent } from "@/socket/inventoryEvent";
import {
  emitUpdateSaleEvent,
  emitUpdateSaleItemEvent,
} from "@/socket/saleEvent";
import {
  emitConfirmSaleItemReturnEvent,
  emitCreateSaleItemReturnEvent,
  emitDeleteSaleItemReturnEvent,
} from "@/socket/saleItemReturnEvent";
import { PaginatedResponseIface } from "@/types";
import { saleItemReturnSchema } from "@/validationSchema/bodySchema/saleItemReturnSchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { SaleItemReturnQuerySchema } from "@/validationSchema/querySchema/saleItemReturnQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Between, ILike } from "typeorm";
import { BaseControllers } from "./baseControllers";
import { SaleControllers } from "./saleControllers";

export class SaleItemReturnControllers extends BaseControllers<SaleItemReturn> {
  constructor() {
    super(SaleItemReturn);
    this.objectId = "saleItemReturnId";
  }

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const query: BaseQuerySchema & SaleItemReturnQuerySchema = req.query as any;
    const [saleItemReturns, total] = await this.repository.findAndCount({
      where: {
        status: query.status ? query.status : undefined,
        saleItem: {
          productVariant: {
            name: query.search ? ILike(`%${query.search}%`) : undefined,
            barcode: query.productCode ? query.productCode : undefined,
          },
        },
        approvedBy: {
          id: query.approvedBy ? query.approvedBy : undefined,
        },
        requestedBy: {
          id: query.requestedBy ? query.requestedBy : undefined,
        },
        requestedAt:
          query.from && query.to ? Between(query.from, query.to) : undefined,
      },
      withDeleted: true,
      relations: {
        approvedBy: true,
        requestedBy: true,
        saleItem: {
          productVariant: {
            images: true,
          },
        },
      },
      skip: query.offset,
      take: query.limit,
      order: {
        returnedAt: "DESC",
        requestedAt: "DESC",
      },
    });

    const response: PaginatedResponseIface<SaleItemReturn> = {
      count: total,
      next: null,
      previous: null,
      results: saleItemReturns,
    };
    res.status(200).json(response);
  };

  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**
     * validate the body
     */
    const validatedData = await saleItemReturnSchema.validateAsync(req.body);
    /**
     * start transaction
     */
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        /**
         * repository declarations
         */
        const saleItemRepository = transactionManager.getRepository(SaleItem);
        const saleItemReturnRepository =
          transactionManager.getRepository(SaleItemReturn);
        /**
         * get the saleItem along the corresponding previous returned items
         */
        const saleItem = await throwErrorIfNotFound(saleItemRepository, {
          where: {
            id: validatedData.saleItemId,
          },
          relations: {
            saleItemReturns: true,
            sale: {
              saleAgent: true,
            },
          },
          withDeleted: true,
        });
        if (saleItem.sale.saleAgent.id != req.user.id) {
          throw new ForbiddenError(
            "Return denied: The sale item does not belong to you."
          );
        }
        /**
         * check if there is pending return request for given SaleItem
         */
        if (
          saleItem.saleItemReturns.some(
            (saleItemReturn) =>
              saleItemReturn.status == SALE_RETURN_STATUS.PENDING
          )
        ) {
          throw new BadRequestError(
            "sorry! first approve the previous request"
          );
        }
        /**
         * total returned or requested
         */
        const previousReturned = saleItem.saleItemReturns.reduce((acc, cur) => {
          acc += cur.quantity;
          return acc;
        }, 0);
        /**
         * current valid quantity to return
         */
        const valideToReturn = saleItem.quantity - previousReturned;
        /**
         * check if the requested is less than the available sold items
         */
        if (valideToReturn < validatedData.quantity) {
          throw new BadRequestError(
            `you can not return that is not sold, maximum should be ${valideToReturn}`
          );
        }
        /**
         * calculate the refund price
         */
        const totalRefund =
          saleItem.price * validatedData.quantity -
          validatedData.quantity * (saleItem.discount / saleItem.quantity);
        /**
         * create refund entry
         */
        const savedSaleReturnItem = await saleItemReturnRepository.save(
          saleItemReturnRepository.create({
            saleItem: saleItem,
            refund: totalRefund,
            quantity: validatedData.quantity,
            requestedBy: req.user,
            reason: ReturnReason.CUSTOMER_CHANGED_MIND,
            status: SALE_RETURN_STATUS.PENDING,
          })
        );
        /**
         * create sale item return socket event
         */
        emitCreateSaleItemReturnEvent(io, [
          {
            id: savedSaleReturnItem.id,
          },
        ]);
        /**
         * get updated sale item for broadcast
         */
        const updatedSaleItem = await throwErrorIfNotFound(saleItemRepository, {
          where: {
            id: validatedData.saleItemId,
          },
          relations: {
            saleItemReturns: true,
          },
          withDeleted: true,
        });
        /**
         * emit update sale item socket event.
         */
        emitUpdateSaleItemEvent(io, [
          {
            id: updatedSaleItem.id,
            saleItemReturns: updatedSaleItem.saleItemReturns,
          },
        ]);
        res.status(200).json({
          detail: "successfully return is requested",
          id: savedSaleReturnItem.id,
        });
      } catch (error) {
        next(error);
      }
    });
  };

  confirmSaleItemReturn: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const saleItemReturnRepository =
          transactionManager.getRepository(SaleItemReturn);
        const saleItemRepository = transactionManager.getRepository(SaleItem);
        const saleRepository = transactionManager.getRepository(Sale);
        const inventoryRepository = transactionManager.getRepository(Inventory);
        const productVariantRepository =
          transactionManager.getRepository(ProductVariant);
        /**
         * get the saleItemReturn entry
         */
        const saleItemReturn = await throwErrorIfNotFound(
          saleItemReturnRepository,
          {
            where: {
              id: req.params[this.objectId],
            },
            relations: {
              requestedBy: true,
              saleItem: {
                productVariant: {
                  inventory: true,
                },
              },
            },
            withDeleted: true,
          }
        );
        /**
         * check if the user is try to approve not requested by his
         */
        if (req.user.id == saleItemReturn.requestedBy.id) {
          throw new ForbiddenError(
            "sorry! you can't approve. because you requested the approval"
          );
        }
        /**
         * check if it approved
         */
        if (saleItemReturn.status == SALE_RETURN_STATUS.APPROVED) {
          throw new BadRequestError("the returned sale is already Approved");
        }
        /**
         * update the inventory
         */
        saleItemReturn.saleItem.productVariant.inventory.available =
          saleItemReturn.saleItem.productVariant.inventory.available +
          saleItemReturn.quantity;
        /**
         * update sale item return status
         */
        saleItemReturn.status = SALE_RETURN_STATUS.APPROVED;
        saleItemReturn.approvedBy = req.user;
        /**
         * check if the product were removed then restore
         */
        if (saleItemReturn.saleItem.productVariant.deletedAt) {
          await productVariantRepository.restore({
            id: saleItemReturn.saleItem.productVariant.id,
          });
        }
        /**
         * save inventory change
         */
        const updatedInventory = await inventoryRepository.save(
          saleItemReturn.saleItem.productVariant.inventory
        );
        /**
         * save sale item return change
         */
        const updatedSaleItemReturn = await saleItemReturnRepository.save(
          saleItemReturn
        );
        /**
         * emit confirm socket event
         */
        emitConfirmSaleItemReturnEvent(io, [
          {
            id: updatedSaleItemReturn.id,
            status: updatedSaleItemReturn.status,
          },
        ]);
        /**
         * emit inventory update socket event
         */
        emitUpdateInventoryEvent(io, [
          {
            id: updatedInventory.id,
            available: updatedInventory.available,
          },
        ]);
        /**
         * get updated sale item for broadcast
         */
        const updatedSaleItem = await throwErrorIfNotFound(saleItemRepository, {
          where: {
            id: saleItemReturn.saleItem.id,
          },
          relations: {
            saleItemReturns: true,
            sale: true,
          },
          withDeleted: true,
        });
        /**
         * emit update sale item socket event.
         */
        emitUpdateSaleItemEvent(io, [
          {
            id: updatedSaleItem.id,
            saleItemReturns: updatedSaleItem.saleItemReturns,
          },
        ]);
        /**
         * update sale
         */
        const updatedSale = await SaleControllers.getUpdatedSaleFieldById(
          saleRepository,
          updatedSaleItem.sale.id
        );
        /**
         * emit sale change socket event
         */
        emitUpdateSaleEvent(io, [updatedSale]);
        /**
         * emit refresh product Variant socket event
         */
        res.status(200).json({
          detail: "successfully confirmed the return process",
          id: req.params[this.objectId],
        });
      } catch (error) {
        next(error);
      }
    });
  };

  destroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const saleItemReturnRepository =
          transactionManager.getRepository(SaleItemReturn);
        const saleItemRepository = transactionManager.getRepository(SaleItem);
        const saleItem = await throwErrorIfNotFound(saleItemRepository, {
          where: {
            saleItemReturns: { id: req.params[this.objectId] },
          },
          relations: {
            saleItemReturns: true,
          },
        });
        /**
         * find the active and pending sale item return
         */
        const saleItemReturn = saleItem.saleItemReturns.find(
          (saleItemReturn) =>
            saleItemReturn.id == req.params[this.objectId] &&
            saleItemReturn.status == SALE_RETURN_STATUS.PENDING
        );
        if (!saleItemReturn) {
          throw new NotFoundError();
        }

        await saleItemReturnRepository.delete({ id: saleItemReturn.id });

        /**
         * remove sale item return
         */
        emitDeleteSaleItemReturnEvent(io, [
          {
            id: req.params[this.objectId],
          },
        ]);
        /**
         * emit update sale item socket event
         */
        emitUpdateSaleItemEvent(io, [
          {
            id: saleItem.id,
            saleItemReturns: saleItem.saleItemReturns.filter(
              (saleItemReturn) => saleItemReturn.id != req.params[this.objectId]
            ),
          },
        ]);
        res.status(204).json();
      } catch (error) {
        next(error);
      }
    });
  };
}
