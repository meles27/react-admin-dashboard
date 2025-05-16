import { AppDataSource } from "@/data-source";
import { Inventory } from "@/entity/Inventory";
import { Category } from "@/entity/product/Category";
import { Product } from "@/entity/product/Product";
import { ProductVariant } from "@/entity/product/ProductVariant";
import { throwErrorIfNotFound } from "@/exceptions";
import {
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
} from "@/exceptions/errorClasses";
import { Settings } from "@/settings";
import { io } from "@/socket";
import {
  emitDeleteInventoryEvent,
  emitRefreshInventoryEvent,
} from "@/socket/inventoryEvent";
import {
  emitCreateProductEvent,
  emitCreateProductVariantEvent,
  emitDeleteProductEvent,
  emitDeleteProductVariantEvent,
  emitUpdateProductEvent,
  emitUpdateProductVariantEvent,
} from "@/socket/productEvent";
import { PaginatedResponseIface } from "@/types";
import { createProductSchema } from "@/validationSchema/bodySchema/productSchema";
import {
  createProductVariantSchema,
  updateProductVariantSchema,
} from "@/validationSchema/bodySchema/productVariantSchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import {
  ProductQuerySchema,
  ProductVariantQuerySchema,
} from "@/validationSchema/querySchema/productQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "node-color-log";
import { ILike, In, Repository } from "typeorm";
import { BaseControllers } from "./baseControllers";

export class ProductControllers extends BaseControllers<Product> {
  constructor() {
    super(Product);
    this.objectId = "productId";
  }

  static getUpdatedProductFieldById: (
    repo: Repository<Product>,
    id: string
  ) => Promise<{
    id: string;
    min_price: string;
    max_price: string;
    total_variants: string;
  }> = async (repo: Repository<Product>, id: string) => {
    return await repo
      .createQueryBuilder("product")
      .leftJoin("product.productVariants", "productVariants")
      .select("product.id", "id")
      .addSelect("MIN(productVariants.price)", "min_price")
      .addSelect("MAX(productVariants.price)", "max_price")
      .addSelect("COUNT(productVariants.id)", "total_variants")
      .where("product.id = :id", { id })
      .groupBy("product.id")
      .getRawOne();
  };

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema & ProductQuerySchema = req.query as any;
    const queryBuilder = this.repository
      .createQueryBuilder("product")
      .leftJoin("product.category", "category")
      .leftJoin("product.productVariants", "productVariants")
      .select("product")
      .addSelect("MIN(productVariants.price)", "min_price")
      .addSelect("MAX(productVariants.price)", "max_price")
      .addSelect("COUNT(productVariants.id)", "total_variants");

    if (queryParams.categoryId) {
      queryBuilder.andWhere("category.id = :categoryId", {
        categoryId: queryParams.categoryId,
      });
    }

    if (queryParams.search) {
      queryBuilder.andWhere(
        "(product.name ILIKE :search OR product.description ILIKE :search OR category.name ILIKE :search OR productVariants.name ILIKE :search OR productVariants.name ILIKE :search)",
        {
          search: `%${queryParams.search}%`,
        }
      );
    }
    const products = await queryBuilder
      .groupBy("product.id")
      .offset(queryParams.offset)
      .limit(queryParams.limit)
      .getRawMany();
    /**
     * total products
     */
    const total = await queryBuilder.getCount();

    /**
     * api response
     */
    const response: PaginatedResponseIface<any> = {
      count: total,
      next: null,
      previous: null,
      results: this.formattedList(products, {
        prefixes: ["product_"],
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
     * 1. pre transaction
     * validate data
     */
    const { categoryId, ...validatedData } =
      await createProductSchema.validateAsync(req.body);

    /**
     * 2. transaction
     */
    const product = new Product();
    Object.assign(product, validatedData);
    product.category = { id: categoryId } as Category;
    const response = await this.repository.save(product);
    /**
     * 3. post transaction
     * create product socket event
     */
    emitCreateProductEvent(io, [response]);
    /**
     * 4. update product with saved image
     */
    if (req.file) {
      req.cloudinary
        .uploadImage(req.file, {
          folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_PRODUCT_FOLDER,
        })
        .then(async (productInfo) => {
          product.hero = productInfo.secure_url;
          product.hero_public_id = productInfo.public_id;
          const saved = await this.repository.save(product);
          emitUpdateProductEvent(io, [saved]);
        })
        .catch((error) => {
          logger.error("Cloudinary product image upload failed", error);
          throw new ServiceUnavailableError("Product image processing failed");
        });
    }
    /**
     * http response
     */
    res.status(200).json(response);
  };

  retrieve: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryBuilder = this.repository
      .createQueryBuilder("product")
      .leftJoin("product.productVariants", "productVariants")
      .select("product")
      .addSelect("MIN(productVariants.price)", "min_price")
      .addSelect("MAX(productVariants.price)", "max_price")
      .addSelect("COUNT(productVariants.id)", "total_variants");
    const product = await queryBuilder
      .where("product.id = :id", { id: req.params.productId })
      .groupBy("product.id")
      .getRawOne();
    /**
     * raise resource not found
     */
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    /**
     * api response
     */
    res.status(200).json(
      this.formattedObject(product, {
        prefixes: ["product_"],
      })
    );
  };

  update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**
     * 1. pre transaction
     * validate data
     */
    const { categoryId, ...validatedData } =
      await createProductSchema.validateAsync(req.body);

    /**
     * 2. transaction
     */
    const product = await this.getObject(req);
    Object.assign(product, validatedData);
    /**
     * check if category id is given
     */
    if (categoryId) {
      product.category = { id: categoryId } as Category;
    }

    if (req.file) {
      req.cloudinary
        .updateImage(product.hero_public_id, req.file, {
          folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_PRODUCT_FOLDER,
        })
        .then(async (productInfo) => {
          product.hero = productInfo.secure_url;
          product.hero_public_id = productInfo.public_id;
          const updated = await this.repository.save(product);
          emitUpdateProductEvent(io, [updated]);
        })
        .catch((error) => {
          logger.error("Cloudinary category image upload failed", error);
          throw new ServiceUnavailableError("Category image processing failed");
        });
    }

    const updatedProduct = await this.repository.save(product);
    /**
     * update product socket event
     */
    emitUpdateProductEvent(io, [updatedProduct]);
    /**
     * http response
     */
    res.status(200).json(updatedProduct);
  };

  softDestroy: RequestHandler = async (req, res, next) => {
    /**
     * delete the product
     */
    const deletedProduct = await AppDataSource.transaction(async (manager) => {
      const product = await manager.findOneOrFail(Product, {
        where: { id: req.params[this.objectId] },
        relations: { productVariants: { inventory: true } },
      });

      if (product.productVariants.length > 0) {
        throw new ForbiddenError(
          `Cannot delete product with ${product.productVariants.length} variants`
        );
      }
      return await manager.softRemove(product);
    });
    /**
     * 2. Post-transaction side effects (isolated try/catch)
     */
    req.cloudinary
      .deleteImage(deletedProduct.hero_public_id)
      .then((response) => {
        logger.color("blue").log("deleted image", response);
      })
      .catch((error) => logger.color("red").log(error));
    /**
     * delete product socket event
     */
    emitDeleteProductEvent(io, [
      {
        id: deletedProduct.id,
        name: deletedProduct.name,
      },
    ]);
    res.status(204).json();
  };

  listProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema & ProductVariantQuerySchema =
      req.query as any;
    const variantRepo = AppDataSource.getRepository(ProductVariant);
    const [productVariants, total] = await variantRepo.findAndCount({
      where: {
        product: {
          id: req.params[this.objectId],
        },
        id: queryParams.ids ? In(queryParams.ids) : undefined,
        barcode: queryParams.barcode ? queryParams.barcode : undefined,
        name: queryParams.search ? ILike(`%${queryParams.search}%`) : undefined,
      },
      relations: {
        inventory: true,
        images: true,
      },
      skip: queryParams.offset,
      take: queryParams.limit,
    });
    const response: PaginatedResponseIface<ProductVariant> = {
      count: total,
      next: null,
      previous: null,
      results: productVariants,
    };
    res.status(200).json(response);
  };

  createProductVariant: RequestHandler = async (req, res, next) => {
    // 1. Pre-transaction logic (validation)
    const validatedData = await createProductVariantSchema.validateAsync(
      req.body
    );

    /**
     * 2.transaction logic
     */
    const { savedProductVariant, productInfo } =
      await AppDataSource.transaction(async (transactionManager) => {
        const productVariant = transactionManager.create(ProductVariant, {
          ...validatedData,
          product: { id: req.params[this.objectId] },
        });
        // Save variant and images
        const savedProductVariant = await transactionManager.save(
          productVariant
        );
        // Create inventory
        await transactionManager.save(Inventory, {
          productVariant: savedProductVariant,
        });
        // Get updated product stats
        const productInfo = await ProductControllers.getUpdatedProductFieldById(
          transactionManager.getRepository(Product),
          req.params[this.objectId]
        );
        return { savedProductVariant, productInfo };
      });
    /**
     * 3. post transaction
     */
    /**
     * start non-blocking image upload
     */
    if (req.file) {
      req.cloudinary.uploadImage(req.file).then(async (response) => {
        savedProductVariant.icon = response.secure_url;
        savedProductVariant.icon_public_id = response.public_id;
        const withImage = await AppDataSource.getRepository(
          ProductVariant
        ).save(savedProductVariant);
        /**
         * update product socket event
         */
        emitUpdateProductVariantEvent(io, [withImage]);
      });
    }
    /**
     * create product variant socket event
     */
    emitCreateProductVariantEvent(io, [{ id: savedProductVariant.id }]);
    /**
     * update product socket event
     */
    emitUpdateProductEvent(io, [productInfo]);
    /**
     * update inventory socket event
     */
    emitRefreshInventoryEvent(io);
    /**
     * http response
     */
    res.status(201).json({
      id: savedProductVariant.id,
      name: savedProductVariant.name,
    });
  };

  retrieveProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const variantRepo = AppDataSource.getRepository(ProductVariant);
    const productVariant = await throwErrorIfNotFound(variantRepo, {
      where: {
        product: {
          id: req.params[this.objectId],
        },
        id: req.params["productVariantId"],
      },
      relations: {
        inventory: true,
        images: true,
      },
    });
    res.status(200).json(productVariant);
  };

  updateProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // 1. Pre-transaction validation
    const validatedData = await updateProductVariantSchema.validateAsync(
      req.body
    );
    /**
     * 2. Transaction
     */
    const { updatedVariant, productInfo } = await AppDataSource.transaction(
      async (transactionManager) => {
        const variantRepo = transactionManager.getRepository(ProductVariant);
        const productRepo = transactionManager.getRepository(Product);
        /**
         * get product variant
         */
        const productVariant = await throwErrorIfNotFound(variantRepo, {
          where: {
            product: {
              id: req.params[this.objectId],
            },
            id: req.params["productVariantId"],
          },
          relations: {
            images: true,
          },
        });
        /**
         * update product variant
         */
        variantRepo.merge(productVariant, validatedData);
        /**
         * update product variant
         */
        const updatedVariant = await variantRepo.save(productVariant);
        // Get updated product stats
        const productInfo = await ProductControllers.getUpdatedProductFieldById(
          productRepo,
          req.params[this.objectId]
        );
        return { updatedVariant, productInfo };
      }
    );
    /**
     * 3. Post-transaction side effects
     */
    emitUpdateProductVariantEvent(io, [updatedVariant]);
    emitUpdateProductEvent(io, [productInfo]);
    /**
     * remove from the cloudinary platform
     */
    if (req.file) {
      req.cloudinary
        .updateImage(updatedVariant.icon_public_id, req.file, {
          folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_VARIANT_FOLDER,
        })
        .then(async (response) => {
          updatedVariant.icon = response.secure_url;
          updatedVariant.icon_public_id = response.public_id;
          const withNewImages = await AppDataSource.getRepository(
            ProductVariant
          ).save(updatedVariant);
          emitUpdateProductVariantEvent(io, [
            {
              id: withNewImages.id,
              icon: withNewImages.icon,
              icon_public_id: withNewImages.icon_public_id,
            },
          ]);
        });
    }
    /**
     * update product variant socket event
     */
    emitUpdateProductVariantEvent(io, [updatedVariant]);
    /**
     * update product socket event
     */
    emitUpdateProductEvent(io, [productInfo]);
    /**
     * http response
     */
    res.status(200).json(updatedVariant);
  };

  softDestroyProductVariant: RequestHandler = async (req, res, next) => {
    // 1. Transaction - Only database operations
    const { productInfo, inventoryId, variant } =
      await AppDataSource.transaction(async (transactionManager) => {
        const variantRepo = transactionManager.getRepository(ProductVariant);
        const productRepo = transactionManager.getRepository(Product);
        // Get variant with inventory
        const variant = await variantRepo.findOneOrFail({
          where: {
            product: { id: req.params[this.objectId] },
            id: req.params["productVariantId"],
          },
          relations: ["inventory", "images"],
        });
        // Validate inventory state
        if (
          variant.inventory &&
          (variant.inventory.reserved !== 0 ||
            variant.inventory.available !== 0)
        ) {
          throw new ForbiddenError(
            `Cannot remove variant with existing inventory (${
              variant.inventory.available + variant.inventory.reserved
            } units)`
          );
        }
        // Soft remove variant
        await variantRepo.softRemove(variant);
        // Get updated product stats
        // Get updated product stats
        const productInfo = await ProductControllers.getUpdatedProductFieldById(
          productRepo,
          req.params[this.objectId]
        );
        return {
          productInfo,
          inventoryId: variant.inventory?.id || null,
          variant,
        };
      });
    // 2. Post-transaction side effects
    try {
      /**
       * remove from cloudinary
       */
      await req.cloudinary.deleteImages(
        variant.images.map((image) => image.public_id)
      );
      /**
       * delete product-variant socket event
       */
      emitDeleteProductVariantEvent(io, [
        { id: req.params["productVariantId"] },
      ]);
      if (inventoryId) {
        emitDeleteInventoryEvent(io, [{ id: inventoryId }]);
      }
      emitUpdateProductEvent(io, [productInfo]);
      res.status(204).end();
    } catch (eventError) {
      console.error("Events failed after successful deletion:", eventError);
      res.status(204).end(); // Still success as DB operation completed
    }
  };
}
