import { Request } from "express";
import logger from "node-color-log";

export function printObject(obj: any, indent: string = ""): void {
  // Check if obj is an array
  if (Array.isArray(obj)) {
    console.log(indent + "[");
    obj.forEach((item) => printObject(item, indent + "  "));
    console.log(indent + "]");
  }
  // Check if obj is an object
  else if (typeof obj === "object" && obj !== null) {
    console.log(indent + "{");
    for (const key in obj) {
      const value = obj[key];
      process.stdout.write(indent + `  "${key}": `);
      if (typeof value === "object") {
        console.log("");
        printObject(value, indent + "  ");
      } else {
        logger.color("yellow").log(JSON.stringify(value) + ",");
      }
    }
    console.log(indent + "}");
  }
  // For other types (primitive values)
  else {
    console.log(indent + JSON.stringify(obj));
  }
}

export function printMultipleObjects(...objects: any[]): void {
  logger.color("yellow").italic().log("............start..............");
  objects.forEach((obj, index) => {
    printObject(obj);
  });
  logger.color("yellow").italic().log(".............end..............");
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export function parseDateRange(query: Request["query"]): DateRange {
  const { from, to } = query;

  let fromDate: Date = new Date(0);
  let toDate: Date = new Date(Date.now());

  if (from && typeof from === "string") {
    const parsedFrom = new Date(from);
    if (!isNaN(parsedFrom.getTime())) {
      fromDate = parsedFrom;
    }
  }

  if (to && typeof to === "string") {
    const parsedTo = new Date(to);
    if (!isNaN(parsedTo.getTime())) {
      toDate = parsedTo;
    }
  }

  return { from: fromDate, to: toDate };
}
