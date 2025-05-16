// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const analysisApi = createApi({
  reducerPath: "analysisApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  tagTypes: ["generalAnalysis", "saleAnalysis"],
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    generalAnalysis: builder.query({
      query: () => ({
        url: config.GENERAL_ANALYSIS,
        method: "GET",
      }),
      providesTags: ["generalAnalysis"],
    }),
    saleAnalysis: builder.query({
      query: (searchParams) => ({
        url: config.SALE_ANALYSIS,
        method: "GET",
        params: searchParams,
      }),
      providesTags: ["saleAnalysis"],
    }),
    saleTrendsAnalysis: builder.query({
      query: (searchParams) => ({
        url: config.SALE_TREND_ANALYSIS,
        method: "GET",
        params: searchParams,
      }),
      providesTags: ["saleAnalysis"],
    }),
    popularProducts: builder.query({
      query: (searchParams) => ({
        url: config.POPULAR_PRODUCTS,
        method: "GET",
        params: searchParams,
      }),
      providesTags: ["saleAnalysis"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGeneralAnalysisQuery,
  useSaleAnalysisQuery,
  useSaleTrendsAnalysisQuery,
  usePopularProductsQuery,
} = analysisApi;
