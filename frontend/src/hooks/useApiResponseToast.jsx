import { Typography } from "@material-tailwind/react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import config from "../config";

export const useApiResponseToast = (
  error,
  isError,
  isSuccess,
  options = {}
) => {
  const { successMessage, errorCallback, successCallback } = options;

  useEffect(() => {
    if (isError) {
      const err = error;

      // Execute error callback if provided
      if (errorCallback) {
        Promise.resolve(errorCallback(err)).catch(console.error);
      }

      if (
        err.status !== undefined &&
        config.STATUS_CODE_GROUP_GENERAL.includes(err.status)
      ) {
        toast.error(err.data.detail);
      } else if (
        err.status !== undefined &&
        config.STATUS_CODE_GROUP_VALIDATION.includes(err.status)
      ) {
        toast.error(
          <div>
            <Typography variant="h6">{err.data.detail}</Typography>
            {Object.entries(err.data.errors || {}).map(([key, value]) => (
              <li key={key} className="flex items-start gap-sm">
                <Typography variant="paragraph" className="font-bold">
                  {key}
                </Typography>
                =
                <Typography variant="paragraph">
                  {typeof value === "string" || typeof value === "number"
                    ? value
                    : JSON.stringify(value)}
                </Typography>
              </li>
            ))}
          </div>
        );
      } else if (err) {
        toast.error(err.data.detail);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isError]);

  useEffect(() => {
    console.log("isSuccess", isSuccess);
    if (isSuccess) {
      const message = successMessage || "Successful";
      toast.success(message);

      // Execute success callback if provided
      if (successCallback) {
        Promise.resolve(successCallback(message)).catch(console.error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, successMessage]);
};
