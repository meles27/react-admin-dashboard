const base = "https://gc-family.example.com:3000";
// const base = "https://10.14.26.244:3000";
const PATHS = {
  // authentication and authorization
  AUTH_TOKEN_URL: "/api/v1/auth/token",
  AUTH_REFRESH_TOKEN_URL: "/api/v1/auth/token/refresh",
  AUTH_FORGET_PASSWORD: "/api/v1/auth/reset-password",
  AUTH_CONFIRM_FORGET_PASSWORD: "/api/v1/auth/confirm-reset-password",
  // user handle
  USERS_URL: "/api/v1/users",
  USER_URL: "/api/v1/users/${userId}",
  ACTIVATE_USER_URL: "/api/v1/users/${userId}/activate",
  CHANGE_USER_STATUS_URL: "/api/v1/users/${userId}/change-status",
  CHANGE_USER_ROLE_URL: "/api/v1/users/${userId}/change-role",
  // products route
  PRODUCTS_URL: "/api/v1/products",
  PRODUCT_URL: "/api/v1/products/${productId}",
  // static files route
  IMAGES_URL: base + "${path}",
  // inventory routes
  INVENTORIES_URL: "/api/v1/inventories",
  INVENTORY_URL: "/api/v1/inventories/${inventoryId}",
  //sale order routes
  SALE_ORDERS_URL: "/api/v1/sale-orders",
  SALE_ORDER_URL: "/api/v1/sale-orders/${saleOrderId}",
  COMPLETE_SALE_ORDER_URL: "/api/v1/sale-orders/${saleOrderId}/complete-order",
  CALCULATE_SALE_ORDER_URL: "/api/v1/sale-orders/${saleOrderId}/calculate",
  SALE_ORDER_ITEMS_URL: "/api/v1/sale-orders/${saleOrderId}/order-items",
  SALE_ORDER_ITEM_URL:
    "/api/v1/sale-orders/${saleOrderId}/order-items/${saleOrderItemId}",

  // analysis and report routes
  GENERAL_ANALYSIS: "/api/v1/analysis/general",
  SALE_ANALYSIS: "/api/v1/analysis/sales",
  SALE_TREND_ANALYSIS: "/api/v1/analysis/sales/trends",
  POPULAR_PRODUCTS: "/api/v1/analysis/sales/popular-products",
  // SALE_TREND_ANALYSIS: "/api/v1/analysis/sales/trends",
  AXIOS_JWT_AUTH_PARAM: "jwt",
};

const config = {
  ...PATHS,
  baseUrl: base,
  SCANNER_TERMINATOR: "Enter",
  SCANNER_DEBOUNCE_TIME: 300,
  UPGRADE_ALERT_TIME: 10 * 1000, // 10 seconds
  JWT_KEY_NAME: "token",
  JWT_DEFAULT_VALUE: {
    access: "",
    refresh: "",
  },

  FRONTEND_PATHS: {
    USER_LOGIN_REDIRECT: "/",
    ADMIN_LOGIN_REDIRECT: "/dashboard",
    STUFF_LOGIN_REDIRECT: "/scan",
    LOGOUT_REDIRECT: "/signin",
  },
  PAGE_SIZE: 40,
  SEARCH_PAGINATION_LIMIT: 1000,
  CURRENCY: "ETB",
  TOAST_ERROR_TIMEOUT: 3000,
  TOAST_SUCCESS_TIMEOUT: 1000,
  TOAST_DEFAULT_TIMEOUT: 2000,
  SEARCH_INPUT_DELAY: 400,
  STATUS_CODE_GROUP_VALIDATION: [409, 400],
  STATUS_CODE_GROUP_GENERAL: [401, 402, 403, 404, 500],
};

export default config;
