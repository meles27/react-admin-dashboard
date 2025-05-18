import { useEffect, useRef } from "react";
import { useRefreshTokenMutation } from "../services/authApi";
import { useApiResponseToast } from "./useApiResponseToast";
import useAuth from "./useAuth";

export function useJwtTokenRefresh() {
  const interval = useRef(null);
  const [refresh, refreshResponse] = useRefreshTokenMutation();
  const auth = useAuth();

  // on mounting stage (hook)
  useEffect(() => {
    if (auth.isRefreshExpired()) return;
    refresh({ refresh: auth.jwtToken.refresh });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useApiResponseToast(
    refreshResponse.error,
    refreshResponse.isError,
    refreshResponse.isSuccess,
    {
      errorCallback: () => {
        const error = refreshResponse.error;
        console.log(error);
        if (error?.status == 401) {
          auth.clearJwtToken();
        }
      },
      successCallback: () => {},
      successMessage: "Successfully Refreshed!!!",
    }
  );

  useEffect(() => {
    if (refreshResponse.isSuccess) {
      auth.setJwtToken(refreshResponse.data);
      const accessLifeTime = auth.getAccessTimeLeft();
      if (accessLifeTime > 10) {
        interval.current = setInterval(() => {
          refresh({ refresh: refreshResponse.data.refresh });
        }, accessLifeTime * 1000 - 10);
      }
    }
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshResponse.data, refreshResponse.isSuccess]);

  return { refresh, refreshResponse };
}
