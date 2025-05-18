import classNames from "classnames";
import { useEffect, useState } from "react";
import config from "../../config";

const SearchInput = ({
  className,
  onChange,
  delay = config.SEARCH_INPUT_DELAY,
  value,
  defaultValue,
  ...restProps
}) => {
  const [internalValue, setInternalValue] = useState(
    value ?? defaultValue ?? ""
  );
  const [isTyping, setIsTyping] = useState(false);

  // Sync internal value with external prop changes (e.g., reset input externally)
  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value);
      setIsTyping(false); // Don't debounce when value is externally updated
    }
  }, [value]);

  // Debounced onChange firing (only if user is typing)
  useEffect(() => {
    if (!isTyping) return;

    const handler = setTimeout(() => {
      if (onChange) {
        const syntheticEvent = {
          target: { value: internalValue },
        };
        onChange(syntheticEvent);
      }
      setIsTyping(false); // reset flag after debounce
    }, delay);

    return () => clearTimeout(handler);
  }, [delay, internalValue, isTyping, onChange]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
    setIsTyping(true);
    if (value !== undefined) {
      // controlled input: optional immediate update
      onChange?.(e);
    }
  };

  return (
    <div className="relative w-full max-w-64">
      <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <input
        className={classNames(
          "w-full bg-white border border-neutral-200 shadow-md shadow-neutral-200 p-2 text-[1rem] rounded-lg focus:outline-none focus:border-2 focus:border-neutral-400",
          {
            [className ?? ""]: className,
          }
        )}
        placeholder="search .."
        value={internalValue}
        onChange={handleChange}
        {...restProps}
      />
    </div>
  );
};

export default SearchInput;
