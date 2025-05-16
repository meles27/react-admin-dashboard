import { AppDataSource } from "@/data-source";
import { throwErrorIfNotFound } from "@/exceptions";
import { Request } from "express";
import { FindOneOptions, Repository } from "typeorm";

export class BaseControllers<T> {
  readonly repository: Repository<T>;
  objectId: string;
  parentObjectId: string;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity);
    this.objectId = "objectId";
  }

  // formattedObject = (obj: object, prefixes: string[] = [], parent = "") => {
  //   return Object.entries(obj).reduce((acc, [key, value]) => {
  //     const matchedPrefix = prefixes.find((prefix) => key.startsWith(prefix)); // Find matching prefix
  //     if (matchedPrefix && (parent === "" || parent === matchedPrefix)) {
  //       const keyWithoutPrefix = key.replace(matchedPrefix, "");
  //       acc[keyWithoutPrefix] = value;
  //       return acc;
  //     }

  //     if (matchedPrefix && parent !== matchedPrefix) {
  //       const keyWithoutPrefix = key.replace(matchedPrefix, "");
  //       if (!acc[matchedPrefix.replace(/_$/, "")]) {
  //         acc[matchedPrefix.replace(/_$/, "")] = {};
  //       }
  //       acc[matchedPrefix.replace(/_$/, "")][keyWithoutPrefix] = value;
  //       return acc;
  //     }

  //     acc[key] = value;

  //     return acc;
  //   }, {});
  // };

  _parse_number(value: any) {
    return Number.isNaN(Number(value)) ? value : Number(value);
  }

  formattedObject = (
    obj: object,
    options: {
      prefixes?: string[];
      parseNumber?: boolean;
    } = {
      prefixes: [],
      parseNumber: false,
    }
  ) => {
    /**setup local configurations for the props */
    const configurations: typeof options = {
      prefixes: options.prefixes == undefined ? [] : options.prefixes,
      parseNumber:
        options.parseNumber == undefined ? false : options.parseNumber,
    };

    return Object.entries(obj).reduce((acc, [key, value]) => {
      // Check if the key starts with any of the provided prefixes
      const matchedPrefix = configurations.prefixes.find((prefix) =>
        key.startsWith(prefix)
      );
      // parsed value
      const newValue = configurations.parseNumber
        ? this._parse_number(value)
        : value;
      if (matchedPrefix) {
        // Remove the matched prefix from the key
        const keyWithoutPrefix = key.replace(matchedPrefix, "");
        acc[keyWithoutPrefix] = newValue;
      } else {
        // If no prefix matches, keep the key as is
        acc[key] = newValue;
      }

      return acc;
    }, {});
  };

  formattedList = (
    objects: object[],
    options: {
      prefixes?: string[];
      parseNumber?: boolean;
    } = {}
  ) => {
    return objects.map((baseObj) => this.formattedObject(baseObj, options));
  };

  getObject = async (
    req: Request,
    options: FindOneOptions<T> = {},
    errorMessage?: string
  ) => {
    let query = { id: req.params[this.objectId] } as any;
    const { where, ...rest } = options;

    const object = await throwErrorIfNotFound(
      this.repository,
      {
        where: where ? { ...query, ...where } : query,
        ...rest,
      },
      errorMessage
    );
    return object;
  };

  transformRawToNested<T>(
    rawData: any[],
    aliasMap: Record<string, string>
  ): T[] {
    /**example usage is 
     * 
     *const aliasMap = {
      productVariant: "",
      product: "product",
      supplier: "product.supplier",
    };
    */
    return rawData.map((row) => {
      const nestedObject: any = {};

      // Iterate through the alias map to build nested objects
      for (const [alias, path] of Object.entries(aliasMap)) {
        const keys = path.split(".");
        let current = nestedObject;

        // Navigate or create the nested structure for this alias
        keys.forEach((key, index) => {
          if (!current[key]) {
            current[key] = index === keys.length - 1 ? {} : {};
          }
          current = current[key];
        });

        // Populate fields for the current alias
        Object.keys(row).forEach((key) => {
          if (key.startsWith(alias + "_")) {
            const fieldName = key.replace(alias + "_", "");
            current[fieldName] = row[key];
          }
        });
      }

      const response = { ...nestedObject, ...nestedObject[""] };
      delete response[""];
      return response;
    });
  }
}
