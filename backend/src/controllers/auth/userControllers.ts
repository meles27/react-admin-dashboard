import AppDataSource from "@/data-source";
import { User, USER_ROLE } from "@/entity/User";
import { throwErrorIfNotFound } from "@/exceptions";
import { ForbiddenError } from "@/exceptions/errorClasses";
import { Settings } from "@/settings";
import { io } from "@/socket";
import { emitCreateCategoryEvent } from "@/socket/categoryEvent";
import {
  emitChangeUserRoleEvent,
  emitChangeUserStatusEvent,
  emitDeleteUserEvent,
  emitUpdateUserEvent,
} from "@/socket/userEvent";
import { PaginatedResponseIface } from "@/types";
import { createCategorySchema } from "@/validationSchema/bodySchema/categorySchema";
import {
  userChangeRoleSchema,
  userChangeStatusSchema,
  userUpdateSchema,
} from "@/validationSchema/bodySchema/userSchema";
import { BaseQuerySchema } from "@/validationSchema/querySchema/baseQuerySchema";
import { UserQuerySchema } from "@/validationSchema/querySchema/userQuerySchema";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { BaseControllers } from "../baseControllers";

export class UserControllers extends BaseControllers<User> {
  constructor() {
    super(User);
    this.objectId = "userId";
  }

  list: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const queryParams: BaseQuerySchema & UserQuerySchema = req.query as any;
    const queryBuilder = this.repository.createQueryBuilder("user");
    if (queryParams.search) {
      queryBuilder.where(
        "(user.username ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)",
        { search: `%${queryParams.search}%` }
      );
    }

    if (queryParams.active != undefined) {
      queryBuilder.andWhere("user.active = :active", {
        active: queryParams.active,
      });
    }

    if (queryParams.includeDeleted) {
      queryBuilder.withDeleted();
    }

    if (queryParams.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: queryParams.role,
      });
    }

    const users = await queryBuilder
      .offset(queryParams.offset)
      .limit(queryParams.limit)
      .orderBy("user.dateJoined", "DESC")
      .addOrderBy("user.username", "DESC")
      .getRawMany();
    const total = await queryBuilder.getCount();

    const response: PaginatedResponseIface<any> = {
      count: total,
      next: null,
      previous: null,
      results: this.formattedList(users, {
        prefixes: ["user_"],
      }),
    };
    res.status(200).json(response);
  };

  create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const [validatedData, imageUpload] = await Promise.all([
      createCategorySchema.validateAsync(req.body),
      req.file?.buffer &&
        req.cloudinary.uploadImage(
          {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
          },
          {
            folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_USER_FOLDER,
          }
        ),
    ]);

    // Prepare category data with conditional image properties
    const categoryData = {
      ...validatedData,
      ...(imageUpload && {
        image: imageUpload.secure_url,
        image_public_id: imageUpload.public_id,
      }),
    };

    // Use direct insert for better performance
    const { identifiers } = await this.repository.insert(categoryData);
    const categoryId = identifiers[0].id;

    // Fire-and-forget event emission
    setImmediate(() => {
      emitCreateCategoryEvent(io, [
        {
          id: categoryId,
          name: validatedData.name,
        },
      ]);
    });

    // Minimal response
    res.status(201).json({
      id: categoryId,
    });
  };

  retrieve: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = await this.getObject(req);
    res.status(200).json(user);
  };

  update: RequestHandler = async (req, res, next): Promise<void> => {
    try {
      const { role, ...validatedData } = await userUpdateSchema.validateAsync(
        req.body
      );
      const user = await this.getObject(req);
      const currentUser = req.user;
      const isAdmin = currentUser.role === USER_ROLE.ADMIN;
      const isSelf = currentUser.id === user.id;

      if (!isAdmin && !isSelf) {
        res.status(403).json({
          detail: "You do not have permission to perform this action.",
        });
        throw new ForbiddenError();
      }

      // Apply validated data
      Object.assign(user, validatedData);

      // Allow role change only if admin
      if (isAdmin && role) {
        user.role = role;
      }
      // Upload new profile image if provided
      if (req.file) {
        const { secure_url, public_id } = await req.cloudinary.updateImage(
          user.image_public_id,
          req.file,
          {
            folder: Settings.CLOUDINARY_CONFIG.CLOUDINARY_USER_FOLDER,
          }
        );
        user.image = secure_url;
        user.image_public_id = public_id;
      }

      const updatedUser = await this.repository.save(user);

      // Emit socket event
      emitUpdateUserEvent(io, [updatedUser]);
      // Send response
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  softDestroy: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await AppDataSource.transaction(async (transactionManager) => {
      try {
        const userRepository = transactionManager.getRepository(User);
        const user = await throwErrorIfNotFound(userRepository, {
          where: {
            id: req.params[this.objectId],
          },
        });
        /**
         * soft delete
         */
        await userRepository.softRemove(user);
        /**
         * socket remove user notification
         */
        emitDeleteUserEvent(io, [
          {
            id: req.params[this.objectId],
          },
        ]);
        /**
         * http response
         */
        res.status(204).json();
      } catch (error) {
        next(error);
      }
    });
  };

  changeStatus: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validatedData = await userChangeStatusSchema.validateAsync(req.body);

    await this.repository.update(
      { id: req.params[this.objectId], active: !validatedData.active },
      {
        active: validatedData.active,
      }
    );
    /**
     * socket change status user notification
     */
    emitChangeUserStatusEvent(io, [
      {
        id: req.params[this.objectId],
        active: validatedData.active,
      },
    ]);
    /**
     * http response
     */
    res.status(200).json({
      id: req.params[this.objectId],
      detail: validatedData.active
        ? "User has been activated"
        : "User has been de-activated",
    });
  };

  changeRole: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const validatedData = await userChangeRoleSchema.validateAsync(req.body);

    await this.repository.update(
      { id: req.params[this.objectId] },
      { role: validatedData.role }
    );
    /**
     * socket change user role notification
     */
    emitChangeUserRoleEvent(io, [
      {
        id: req.params[this.objectId],
        role: validatedData.role,
      },
    ]);
    /**
     * http response
     */
    res.status(200).json({
      id: req.params[this.objectId],
      detail: "User role has been updated",
    });
  };
}
