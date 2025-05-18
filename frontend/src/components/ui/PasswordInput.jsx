import { Tooltip } from "@material-tailwind/react";
import classNames from "classnames";
import { forwardRef, useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";

const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

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
        type={showPassword ? "text" : "password"}
        ref={ref}
        style={{ paddingRight: "2rem", ...props.style }}
      />

      <Tooltip
        content={showPassword ? "hide" : "show"}
        className="bg-neutral-300 text-neutral-900"
        variant="outlined"
      >
        <button
          type="button"
          onClick={toggleVisibility}
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontSize: "0.9rem",
          }}
          tabIndex={-1}
        >
          {showPassword ? (
            <BiHide size={20} color="gray" />
          ) : (
            <BiShow size={20} color="gray" />
          )}
        </button>
      </Tooltip>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
