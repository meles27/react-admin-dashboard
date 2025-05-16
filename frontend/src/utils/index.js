// import {
//   Attributes,
//   ProductData,
//   Variant,
// } from "../components/dashboard/products/addProduct/_types";

import config from "../config";

export function formatEpochToDate(epochMillSeconds) {
  const date = new Date(epochMillSeconds); // Convert seconds to milliseconds
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function formatPrice(
  amount,
  currency = config.CURRENCY,
  shortVersion = false
) {
  const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(parsedAmount)) {
    return "Invalid amount";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });

  if (parsedAmount >= 1e6 && shortVersion) {
    return formatter.format(parsedAmount / 1e6) + "M";
  } else if (parsedAmount >= 1e3 && shortVersion) {
    return formatter.format(parsedAmount / 1e3) + "K";
  } else {
    return formatter.format(parsedAmount);
  }
}

export function formatNumber(
  value,
  shortVersion = false,
  decimals = 2,
  locale = "en-US"
) {
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(parsedValue)) {
    return "Invalid number";
  }

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  if (shortVersion) {
    if (parsedValue >= 1e9) {
      return formatter.format(parsedValue / 1e9) + "B";
    } else if (parsedValue >= 1e6) {
      return formatter.format(parsedValue / 1e6) + "M";
    } else if (parsedValue >= 1e3) {
      return formatter.format(parsedValue / 1e3) + "K";
    }
  }

  return formatter.format(parsedValue);
}

export function printFormattedErrorObject(v = {}) {
  let result = "";

  for (const key in v) {
    if (Object.prototype.hasOwnProperty.call(v, key)) {
      const value = v[key];
      result += `${key}: ${String(value)}\n`; // Convert the value to string
    }
  }

  return result;
}
