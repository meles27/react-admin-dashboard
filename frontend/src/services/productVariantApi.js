// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const productVariantApi = createApi({
  reducerPath: "productVariantApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  tagTypes: ["productVariant"],
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    listProductVariant: builder.query({
      query: (queryParams) => ({
        url: config.PRODUCTVARIANTS_URL,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["productVariant"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useListProductVariantQuery } = productVariantApi;
