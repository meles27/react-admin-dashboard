import classNames from "classnames";
import { forwardRef } from "react";

const HtmlInput = forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-block w-full">
      <input
        className={classNames(
          "border border-neutral-400 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-300 rounded-md p-2 w-full outline-none transition-all",
          {
            [className || ""]: className,
          }
        )}
        {...props}
        ref={ref}
      />
    </div>
  );
});

HtmlInput.displayName = "HtmlInput";

export default HtmlInput;
