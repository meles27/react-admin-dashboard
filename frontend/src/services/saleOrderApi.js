// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const saleOrderApi = createApi({
  reducerPath: "saleOrderApi",

  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  tagTypes: ["saleOrder", "saleOrderItem", "calculateSaleOrder"],
  endpoints: (builder) => ({
    listSaleOrders: builder.query({
      query: (queryParams = {}) => ({
        url: config.SALE_ORDERS_URL,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["saleOrder"],
    }),
    createSaleOrder: builder.mutation({
      query: (arg) => ({
        url: config.SALE_ORDERS_URL,
        method: "POST",
        data: arg,
      }),
    }),
    retrieveSaleOrder: builder.query({
      query: (orderId) => ({
        url: config.SALE_ORDER_URL.replace("${saleOrderId}", orderId),
        method: "GET",
      }),
      providesTags: ["saleOrder"],
    }),
    destroySaleOrder: builder.mutation({
      query: (orderId) => ({
        url: config.SALE_ORDER_URL.replace("${saleOrderId}", orderId),
        method: "DELETE",
      }),
    }),
    completeSaleOrder: builder.mutation({
      query: (orderId) => ({
        url: config.COMPLETE_SALE_ORDER_URL.replace("${saleOrderId}", orderId),
        method: "POST",
      }),
    }),
    calculateSaleOrder: builder.query({
      query: (orderId) => ({
        url: config.CALCULATE_SALE_ORDER_URL.replace("${saleOrderId}", orderId),
        method: "GET",
      }),
      providesTags: ["calculateSaleOrder"],
    }),
    listSaleOrderItems: builder.query({
      query: ({ orderId, ...queryParams }) => ({
        url: config.SALE_ORDER_ITEMS_URL.replace("${saleOrderId}", orderId),
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["saleOrderItem"],
    }),
    createSaleOrderItems: builder.mutation({
      query: ({ orderId, orderItems }) => ({
        url: config.SALE_ORDER_ITEMS_URL.replace("${saleOrderId}", orderId),
        method: "POST",
        data: orderItems,
      }),
      invalidatesTags: ["calculateSaleOrder"],
    }),
    retreiveSaleOrderItem: builder.query({
      query: ({ orderId, orderItemId }) => ({
        url: config.SALE_ORDER_ITEM_URL.replace(
          "${saleOrderId}",
          orderId
        ).replace("${saleOrderItemId}", orderItemId),
        method: "GET",
      }),
      providesTags: ["saleOrderItem"],
    }),
    updateSaleOrderItem: builder.mutation({
      query: ({ orderId, orderItemId, quantity, discount }) => ({
        url: config.SALE_ORDER_ITEM_URL.replace(
          "${saleOrderId}",
          orderId
        ).replace("${saleOrderItemId}", orderItemId),
        method: "PUT",
        data: { quantity, discount },
      }),
      invalidatesTags: ["calculateSaleOrder"],
    }),
    destroySaleOrderItem: builder.mutation({
      query: ({ orderId, orderItemId }) => ({
        url: config.SALE_ORDER_ITEM_URL.replace(
          "${saleOrderId}",
          orderId
        ).replace("${saleOrderItemId}", orderItemId),
        method: "DELETE",
      }),
      invalidatesTags: ["calculateSaleOrder"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useListSaleOrdersQuery,
  useCreateSaleOrderMutation,
  useRetrieveSaleOrderQuery,
  useDestroySaleOrderMutation,
  useCompleteSaleOrderMutation,
  useCalculateSaleOrderQuery,
  useListSaleOrderItemsQuery,
  useCreateSaleOrderItemsMutation,
  useRetreiveSaleOrderItemQuery,
  useUpdateSaleOrderItemMutation,
  useDestroySaleOrderItemMutation,
} = saleOrderApi;
