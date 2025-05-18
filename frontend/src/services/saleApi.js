// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const saleApi = createApi({
  reducerPath: "saleApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  tagTypes: ["sale", "saleItem"],
  // make caching system to stop
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    listSales: builder.query({
      query: (queryParams) => ({
        url: config.SALES_URL,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["sale"],
    }),
    listSaleItems: builder.query({
      query: ({ saleId, ...queryParams }) => ({
        url: config.SALE_PRODUCTS_URL.replace("${saleId}", saleId),
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["saleItem"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useListSalesQuery, useListSaleItemsQuery } = saleApi;
