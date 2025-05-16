// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  endpoints: (builder) => ({
    jwtToken: builder.mutation({
      query: (arg) => {
        return {
          url: config.AUTH_TOKEN_URL,
          method: "POST",
          data: arg,
        };
      },
    }),

    refreshToken: builder.mutation({
      query: (arg) => {
        return {
          url: config.AUTH_REFRESH_TOKEN_URL,
          method: "POST",
          data: arg,
        };
      },
    }),

    forgetPassword: builder.mutation({
      query: (arg) => {
        return {
          url: config.AUTH_FORGET_PASSWORD,
          method: "POST",
          data: arg,
        };
      },
    }),
    confirmForegetPassword: builder.mutation({
      query: (arg) => {
        return {
          url: config.AUTH_CONFIRM_FORGET_PASSWORD,
          method: "POST",
          data: arg,
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useJwtTokenMutation,
  useRefreshTokenMutation,
  useForgetPasswordMutation,
  useConfirmForegetPasswordMutation,
} = authApi;
