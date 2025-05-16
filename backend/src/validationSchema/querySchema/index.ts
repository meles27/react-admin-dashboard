import Joi from "joi";
import { baseQuerySchema } from "./baseQuerySchema";

export enum DATE_TIME_INTERVAL {
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}
