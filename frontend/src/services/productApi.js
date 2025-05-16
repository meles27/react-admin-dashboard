// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  tagTypes: ["product", "productVariant"],
  endpoints: (builder) => ({
    listProducts: builder.query({
      query: (queryParams) => ({
        url: config.PRODUCTS_URL,
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["product"],
    }),
    createProduct: builder.mutation({
      query: (product) => ({
        url: config.PRODUCTS_URL,
        method: "POST",
        data: product,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    retrieveProduct: builder.query({
      query: (productId) => ({
        url: config.PRODUCT_URL.replace("${productId}", productId),
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, product }) => ({
        url: config.PRODUCT_URL.replace("${productId}", id),
        method: "PUT",
        data: product,
      }),
    }),

    destroyProduct: builder.mutation({
      query: (productId) => ({
        url: config.PRODUCT_URL.replace("${productId}", productId),
        method: "DELETE",
      }),
    }),
    listVariants: builder.query({
      query: ({ productId, ...queryParams }) => ({
        url: config.PRODUCT_PRODUCTVARIANTS_URL.replace(
          "${productId}",
          productId
        ),
        method: "GET",
        params: queryParams,
      }),
      providesTags: ["productVariant"],
    }),
    createVariant: builder.mutation({
      query: ({ productId, variant }) => ({
        url: config.PRODUCT_PRODUCTVARIANTS_URL.replace(
          "${productId}",
          productId
        ),
        method: "POST",
        data: variant,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    retrieveVariant: builder.query({
      query: ({ productId, variantId }) => ({
        url: config.PRODUCT_PRODUCTVARIANT_URL.replace(
          "${productId}",
          productId
        ).replace("${productVariantId}", variantId),
        method: "GET",
      }),
      providesTags: ["productVariant"],
    }),
    updateVariant: builder.mutation({
      query: ({ productId, variantId, productVariant }) => ({
        url: config.PRODUCT_PRODUCTVARIANT_URL.replace(
          "${productId}",
          productId
        ).replace("${productVariantId}", variantId),
        method: "PUT",
        data: productVariant,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),

    destroyVariant: builder.mutation({
      query: ({ productId, variantId }) => ({
        url: config.PRODUCT_PRODUCTVARIANT_URL.replace(
          "${productId}",
          productId
        ).replace("${productVariantId}", variantId),
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useListProductsQuery,
  useCreateProductMutation,
  useRetrieveProductQuery,
  useUpdateProductMutation,
  useDestroyProductMutation,
  useListVariantsQuery,
  useCreateVariantMutation,
  useRetrieveVariantQuery,
  useUpdateVariantMutation,
  useDestroyVariantMutation,
} = productApi;
