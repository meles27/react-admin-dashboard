import classNames from "classnames";
import { forwardRef } from "react";

const HtmlTextareaInput = forwardRef(({ className, ...props }, ref) => {
  return (
    <div className="relative inline-block w-full">
      <textarea
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

HtmlTextareaInput.displayName = "HtmlTextareaInput";

export default HtmlTextareaInput;
