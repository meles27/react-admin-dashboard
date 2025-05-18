import AppDataSource from "@/data-source";
import { User, USER_ROLE } from "@/entity/User";
import { throwErrorIfNotFound } from "@/exceptions";
import { ForbiddenError } from "@/exceptions/errorClasses";
import { PaginatedResponseIface } from "@/types";
import { removeFile, saveFileRelativePath } from "@/utils/file";
import { Password } from "@/utils/password";
import {
  userCreateSchema,
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
  ): Promise<void> => {
    const validatedData = await userCreateSchema.validateAsync(req.body);
    /**create user instance */
    const user = new User();
    /** assign data */
    Object.assign(user, validatedData);
    /** hash the password */
    user.password = await Password.hashPassword(user.password);
    /**
     * save profile image
     */
    if (req.files.length && req.files instanceof Array) {
      user.image = saveFileRelativePath(req.files[0].filename);
    }
    /**
     * save one file
     */
    if (req.file) {
      user.image = saveFileRelativePath(req.file.filename);
    }
    /** save */
    const savedUser = await this.repository.save(user);
    /** remove the password or else it will be exposed */
    savedUser.password = undefined;
    /**
     * return savedUser
     */
    res.status(201).json({
      id: savedUser.id,
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

  update: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { role, ...validatedData } = await userUpdateSchema.validateAsync(
      req.body
    );
    const user = await this.getObject(req);

    if (req.user?.role != USER_ROLE.ADMIN) {
      if (req.user?.id != user.id) {
        res.status(403).json({
          detail: "You do not have permission to perform this action.",
        });
        throw new ForbiddenError();
      }
    }

    Object.assign(user, validatedData);

    if (req.user.role == USER_ROLE.ADMIN) {
      user.role = role;
    }
    /**
     * save profile image
     */
    if (req.files.length && req.files instanceof Array) {
      /**
       * remove the old image
       */
      removeFile(user.image);
      user.image = saveFileRelativePath(req.files[0].filename);
    }
    const response = await this.repository.save(user);
    /**
     * http response
     */
    res.status(200).json(response);
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
        user.active = false;
        /**
         * first make inactive
         */
        await userRepository.save(user);
        /**
         * soft delete
         */
        await userRepository.softRemove(user);
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
