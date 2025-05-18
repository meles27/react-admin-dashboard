import { AppDataSource } from "@/data-source";
import { Inventory } from "@/entity/Inventory";
import { Category } from "@/entity/product/Category";
import { Product } from "@/entity/product/Product";
import { ProductVariant } from "@/entity/product/ProductVariant";
import { throwErrorIfNotFound } from "@/exceptions";
import { ForbiddenError, NotFoundError } from "@/exceptions/errorClasses";
import { PaginatedResponseIface } from "@/types";
import { removeFile, saveFileRelativePath } from "@/utils/file";
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
import { ILike, In } from "typeorm";
import { BaseControllers } from "./baseControllers";

export class ProductControllers extends BaseControllers<Product> {
  constructor() {
    super(Product);
    this.objectId = "productId";
  }

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
    const { categoryId, ...validatedData } =
      await createProductSchema.validateAsync(req.body);
    const product = new Product();
    Object.assign(product, validatedData);
    product.category = { id: categoryId } as Category;
    if (req.files.length && req.files instanceof Array) {
      product.hero = saveFileRelativePath(req.files[0].filename);
    }
    if (req.file) {
      product.hero = saveFileRelativePath(req.file.filename);
    }
    const response = await this.repository.save(product);
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
      throw new NotFoundError();
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
    const { categoryId, ...validatedData } =
      await createProductSchema.validateAsync(req.body);
    const product = await this.getObject(req);
    Object.assign(product, validatedData);
    /**
     * check if category id is given
     */
    if (categoryId) {
      product.category = { id: categoryId } as Category;
    }
    if (req.files.length && req.files instanceof Array) {
      /**
       * remove old image
       */
      removeFile(product.hero);
      /**
       * save the new file
       */
      product.hero = saveFileRelativePath(req.files[0].filename);
    }
    if (req.file) {
      removeFile(product.hero);
      product.hero = saveFileRelativePath(req.file.filename);
    }
    const updatedProduct = await this.repository.save(product);
    /**
     * http response
     */
    res.status(200).json(updatedProduct);
  };

  softDestroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const productRepository = transactionManager.getRepository(Product);
        const product = await throwErrorIfNotFound(productRepository, {
          relations: {
            productVariants: {
              inventory: true,
            },
          },
          where: {
            id: req.params[this.objectId],
          },
        });
        if (product.productVariants.length != 0) {
          throw new ForbiddenError(
            `sorry! you cann't remove. because there are variants under that product. total variants are ${product.productVariants.length}`
          );
        }
        /**
         * remove the product
         */
        await productRepository.softRemove(product);
        /**
         * http response
         */
        res.status(204).json();
      } catch (error) {
        next(error);
      }
    });
  };

  listProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema & ProductVariantQuerySchema =
      req.query as any;
    const productVariantRepository =
      AppDataSource.getRepository(ProductVariant);
    const [productVariants, total] =
      await productVariantRepository.findAndCount({
        where: {
          product: {
            id: req.params[this.objectId],
          },
          id: queryParams.ids ? In(queryParams.ids) : undefined,
          barcode: queryParams.barcode ? queryParams.barcode : undefined,
          name: queryParams.search
            ? ILike(`%${queryParams.search}%`)
            : undefined,
        },
        relations: {
          inventory: true,
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

  createProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const validatedData = await createProductVariantSchema.validateAsync(
      req.body
    );

    await AppDataSource.transaction(async (transactionManager) => {
      const productVariantRepository =
        transactionManager.getRepository(ProductVariant);
      const inventoryRepository = transactionManager.getRepository(Inventory);
      const productRepository = transactionManager.getRepository(Product);

      try {
        const productVariant = new ProductVariant();
        Object.assign(productVariant, validatedData);
        productVariant.product = { id: req.params[this.objectId] } as Product;

        if (req.files && req.files instanceof Array) {
          productVariant.images = req.files.map((file) =>
            saveFileRelativePath(file.filename)
          );
        }

        if (req.file) {
          productVariant.images.push(saveFileRelativePath(req.file.filename));
        }

        const savedProductVariant = await productVariantRepository.save(
          productVariant
        );
        /**
         * update the inventory
         */
        const inventory = new Inventory();
        inventory.productVariant = savedProductVariant;
        await inventoryRepository.save(inventory);
        /**
         * retrieve the changed attribute of product
         */
        const productInfo = await productRepository
          .createQueryBuilder("product")
          .leftJoin("product.productVariants", "productVariants")
          .select("product.id", "id")
          .addSelect("MIN(productVariants.price)", "min_price")
          .addSelect("MAX(productVariants.price)", "max_price")
          .addSelect("COUNT(productVariants.id)", "total_variants")
          .where("product.id = :id", {
            id: req.params[this.objectId],
          })
          .groupBy("product.id")
          .getRawOne();
        /**
         * http response
         */
        res
          .status(201)
          .json({ id: savedProductVariant.id, name: savedProductVariant.name });
      } catch (error) {
        next(error);
      }
    });
  };

  retrieveProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const productVariantRepository =
      AppDataSource.getRepository(ProductVariant);
    const productVariant = await throwErrorIfNotFound(
      productVariantRepository,
      {
        where: {
          product: {
            id: req.params[this.objectId],
          },
          id: req.params["productVariantId"],
        },
        relations: {
          inventory: true,
        },
      }
    );
    res.status(200).json(productVariant);
  };

  updateProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { ["keep-images"]: keepImageUrls, ...validatedData } =
      await updateProductVariantSchema.validateAsync(req.body);
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const productVariantRepository =
          transactionManager.getRepository(ProductVariant);
        const productRepository = transactionManager.getRepository(Product);
        const productVariant = await throwErrorIfNotFound(
          productVariantRepository,
          {
            where: {
              product: {
                id: req.params[this.objectId],
              },
              id: req.params["productVariantId"],
            },
            relations: {
              product: true,
              inventory: true,
            },
          }
        );
        /**
         * populate
         */
        Object.assign(productVariant, validatedData);

        if (req.files && req.files instanceof Array) {
          /**
           * get images that should be kept.
           */
          const keepImages = productVariant.images.filter((image) =>
            keepImageUrls.includes(image)
          );
          /**
           * get the images that should be deleted
           */
          const removeImages = productVariant.images.filter(
            (image) => !keepImageUrls.includes(image)
          );
          /**
           * remove actual file
           */
          removeImages.map((image) => removeFile(image));
          /**
           * save the new image
           */
          productVariant.images = req.files
            .map((file) => saveFileRelativePath(file.filename))
            .concat(keepImages);
        }
        /**
         *  save to database
         */
        const savedProductVariant = await productVariantRepository.save(
          productVariant
        );
        /**
         * retrieve the changed attribute of product
         */
        const productInfo = await productRepository
          .createQueryBuilder("product")
          .leftJoin("product.productVariants", "productVariants")
          .select("product.id", "id")
          .addSelect("MIN(productVariants.price)", "min_price")
          .addSelect("MAX(productVariants.price)", "max_price")
          .addSelect("COUNT(productVariants.id)", "total_variants")
          .where("product.id = :id", {
            id: req.params[this.objectId],
          })
          .groupBy("product.id")
          .getRawOne();
        /**
         * http response
         */
        res.status(200).json(savedProductVariant);
      } catch (error) {
        next(error);
      }
    });
  };

  softDestroyProductVariant: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const productVariantRepository =
          transactionManager.getRepository(ProductVariant);
        const productRepository = transactionManager.getRepository(Product);

        const productVariant = await throwErrorIfNotFound(
          productVariantRepository,
          {
            where: {
              product: {
                id: req.params[this.objectId],
              },
              id: req.params["productVariantId"],
            },
            relations: {
              inventory: true,
            },
          }
        );

        if (
          productVariant.inventory &&
          (productVariant.inventory.reserved != 0 ||
            productVariant.inventory.available != 0)
        ) {
          throw new ForbiddenError(
            `sorry! you cann't remove. because there are some stock in the inventory. ${
              productVariant.inventory.available +
              productVariant.inventory.reserved
            }`
          );
        }
        /**
         * remove from table
         */
        await productVariantRepository.softRemove(productVariant);
        /**
         * retrieve the changed attribute of product
         */
        const productInfo = await productRepository
          .createQueryBuilder("product")
          .leftJoin("product.productVariants", "productVariants")
          .select("product.id", "id")
          .addSelect("MIN(productVariants.price)", "min_price")
          .addSelect("MAX(productVariants.price)", "max_price")
          .addSelect("COUNT(productVariants.id)", "total_variants")
          .where("product.id = :id", {
            id: req.params[this.objectId],
          })
          .groupBy("product.id")
          .getRawOne();
        /**
         * http response
         */
        res.status(204).json();
      } catch (error) {
        next(error);
      }
    });
  };
}
