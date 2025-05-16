import { Category } from "@/entity/product/Category";
import {
  ForbiddenError,
  ServiceUnavailableError,
} from "@/exceptions/errorClasses";
import { Settings } from "@/settings";
import { io } from "@/socket";
import {
  emitCreateCategoryEvent,
  emitDeleteCategoryEvent,
  emitUpdateCategoryEvent,
} from "@/socket/categoryEvent";
import { PaginatedResponseIface } from "@/types";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/validationSchema/bodySchema/categorySchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { CategoryQuerySchema } from "@/validationSchema/querySchema/categoryQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import logger from "node-color-log";
import { BaseControllers } from "./baseControllers";

export class CategoryControllers extends BaseControllers<Category> {
  constructor() {
    super(Category);
    this.objectId = "categoryId";
  }

  list: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const queryParams: BaseQuerySchema & CategoryQuerySchema = req.query as any;
    const queryBuilder = this.repository.createQueryBuilder("category");

    if (queryParams.search) {
      queryBuilder.andWhere("category.name ILIKE :name", {
        name: `%${queryParams.search}%`,
      });
    }

    const categories = await queryBuilder
      .offset(queryParams.offset)
      .limit(queryParams.limit)
      .orderBy("category.name")
      .getMany();
    const total = await queryBuilder.getCount();

    const response: PaginatedResponseIface<Category> = {
      count: total,
      next: null,
      previous: null,
      results: categories,
    };
    res.status(200).json(response);
  };

  create1: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // validate
    const validatedData = await createCategorySchema.validateAsync(req.body);
    // create category object
    const category = new Category();
    // update attributes
    Object.assign(category, validatedData);
    if (req.file) {
      // save the file path to the category
      const uploaded = await req.cloudinary.uploadImage(req.file);
      category.image = uploaded.secure_url;
      category.image_public_id = uploaded.public_id;
    }
    // save category
    const savedCategory = await this.repository.save(category);
    /**
     * create category socket event
     */
    emitCreateCategoryEvent(io, [
      { id: savedCategory.id, name: savedCategory.name },
    ]);
    /**
     * http savedCategory
     */
    res.status(201).json({
      id: savedCategory.id,
      name: savedCategory.name,
    });
  };

  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**
     * 1. post transaction
     */
    const validatedData = await createCategorySchema.validateAsync(req.body);
    /**
     * 2. transaction
     */
    const category = await this.repository.save(
      this.repository.create(validatedData)
    );
    /**
     * 3. post transaction
     * lazy update image if present
     */
    if (req.file) {
      req.cloudinary
        .uploadImage(
          {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
          },
          { folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_CATEGORY_FOLDER }
        )
        .then(async (uploadResult) => {
          category.image = uploadResult.secure_url;
          category.image_public_id = uploadResult.public_id;
          const updatedCategory = await this.repository.save(category);
          /**
           * emit for image update
           */
          emitUpdateCategoryEvent(io, [updatedCategory]);
        })
        .catch((error) => {
          logger.error("Cloudinary category image upload failed", error);
          throw new ServiceUnavailableError("Category image processing failed");
        });
    }
    /**
     *  3. post transaction
     */
    // Defer non-critical operations (event emission)
    setImmediate(() => {
      emitCreateCategoryEvent(io, [
        { id: category.id, name: validatedData.name },
      ]);
    });
    // Send minimal response immediately
    res.status(201).json({
      id: category.id,
      name: validatedData.name,
    });
  };

  retrieve: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const category = await this.getObject(req);
    res.status(200).json(category);
  };

  update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**
     * 1. pre transaction
     * validate
     */
    const validatedData = await updateCategorySchema.validateAsync(req.body);
    /**
     * 2. transaction
     * get category
     */
    const category = await this.getObject(req);
    // update attributes
    Object.assign(category, validatedData);
    // save
    const response = await this.repository.save(category);
    /**
     * 3. post transaction
     * lazy update image if present
     */
    if (req.file) {
      req.cloudinary
        .updateImage(
          response.image_public_id,
          {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
          },
          { folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_CATEGORY_FOLDER }
        )
        .then(async (savedImage) => {
          response.image = savedImage.secure_url;
          response.image_public_id = savedImage.public_id;
          const saved = await this.repository.save(response);
          emitUpdateCategoryEvent(io, [saved]);
        })
        .catch((error) => {
          logger.error("Cloudinary category image upload failed", error);
          throw new ServiceUnavailableError("Category image processing failed");
        });
    }
    /**
     * 3. post transaction
     * update category socket.event
     */
    emitUpdateCategoryEvent(io, [response]);
    // send category
    res.status(200).json(response);
  };

  softDestroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    /**
     * 1. post transaction
     */
    const category = await this.getObject(req, {
      relations: {
        products: true,
      },
    });
    /**
     * first check if there is products under the store
     */
    if (category.products.length != 0) {
      throw new ForbiddenError(
        `sorry! you cann't remove. because there are products under that category. total products are ${category.products.length}`
      );
    }
    /**
     * remove old image
     */
    await this.repository.softDelete({
      id: category.id,
    });
    /**
     * 3. post transaction
     * remove image information from cloudinary
     */
    req.cloudinary
      .deleteImage(category.image_public_id)
      .catch((error) => console.log(error.message));
    /**
     * delete category socket event
     */
    emitDeleteCategoryEvent(io, [
      {
        id: req.params[this.objectId],
      },
    ]);
    res.status(204).json();
  };
}
