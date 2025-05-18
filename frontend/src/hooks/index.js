import { useEffect, useRef } from "react";
import { useLocalStorage } from "usehooks-ts";
import config from "../config";

/**
 * get the token from localstorage
 */
export const useLocalToken = () => {
  return useLocalStorage(config.JWT_KEY_NAME, config.JWT_DEFAULT_VALUE);
};

export function useEventListener(eventName, handler, element, options) {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // If no element is passed, use window as default
    const target =
      element instanceof EventTarget
        ? element
        : element && "current" in element
        ? element.current
        : window;

    if (!target?.addEventListener) return;

    const eventListener = (event) => {
      savedHandler.current?.(event);
    };

    // Type assertion to safely cast the target to the correct type (HTMLElement, Document, or Window)
    target.addEventListener(eventName, eventListener, options);

    return () => {
      target.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}
