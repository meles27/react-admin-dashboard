import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { analysisApi } from "../services/analysisApi";
import { authApi } from "../services/authApi";
import { productVariantApi } from "../services/productVariantApi";
import { saleApi } from "../services/saleApi";
import { userApi } from "../services/userApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [productVariantApi.reducerPath]: productVariantApi.reducer,
    [saleApi.reducerPath]: saleApi.reducer,
    [analysisApi.reducerPath]: analysisApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      productVariantApi.middleware,
      saleApi.middleware,
      analysisApi.middleware
    ),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);
