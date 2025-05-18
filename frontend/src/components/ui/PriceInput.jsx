import classNames from "classnames";
import { forwardRef, useMemo } from "react";
import config from "../../config";

const getCurrencySymbol = (locale, currency) => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const parts = formatter.formatToParts(1);
    const symbolPart = parts.find((part) => part.type === "currency");
    return symbolPart?.value || "$";
  } catch {
    return "$";
  }
};

const PriceInput = forwardRef(
  (
    { className, currency = config.CURRENCY, locale = "en-US", ...props },
    ref
  ) => {
    const currencySymbol = useMemo(
      () => getCurrencySymbol(locale, currency),
      [currency, locale]
    );

    const handleKeyDown = (e) => {
      const allowedKeys = [
        "Backspace",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Delete",
        "Home",
        "End",
      ];
      const isNumberKey = /^[0-9.]$/.test(e.key);
      if (!isNumberKey && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }

      if (
        e.key === "." &&
        (e.currentTarget.value.includes(".") || e.currentTarget.value === "")
      ) {
        e.preventDefault();
      }
    };

    return (
      <div
        style={{ position: "relative", display: "inline-block" }}
        className={props.fullWidth ? "w-full" : ""}
      >
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-800 pointer-events-none font-bold">
          {currencySymbol}
        </span>
        <input
          className={classNames(
            "border border-neutral-400 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300 rounded-md p-2 pl-2xl w-full outline-none transition-all",
            {
              [className || ""]: className,
            }
          )}
          {...props}
          ref={ref}
          onKeyDown={handleKeyDown}
          inputMode="decimal"
        />
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

export default PriceInput;
