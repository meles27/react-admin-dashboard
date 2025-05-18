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
  // categories routes
  CATEGORIES_URL: "/api/v1/categories",
  CATEGORIE_URL: "/api/v1/categories/${categoryId}",
  // products route
  PRODUCTS_URL: "/api/v1/products",
  PRODUCT_URL: "/api/v1/products/${productId}",
  PRODUCT_PRODUCTVARIANTS_URL: "/api/v1/products/${productId}/product-variants",
  PRODUCT_PRODUCTVARIANT_URL:
    "/api/v1/products/${productId}/product-variants/${productVariantId}",
  PRODUCTVARIANTS_URL: "/api/v1/product-variants",
  PRODUCTVARIANT_URL: "/api/v1/product-variants/${productVariantId}",
  // static files route
  IMAGES_URL: base + "${path}",
  // sales routes
  SALES_URL: "/api/v1/sales",
  SALE_URL: "/api/v1/sales/${saleId}",
  SALE_CALCULATE_URL: "/api/v1/sales/${saleId}/calculate",
  SALE_PRODUCTS_URL: "/api/v1/sales/${saleId}/sale-items",
  SALE_PRODUCT_URL: "/api/v1/sales/${saleId}/sale-items/${saleProductId}",
  SALE_ITEM_RETURNS_URL: "/api/v1/sale-returns",
  SALE_ITEM_RETURN_URL: "/api/v1/sale-returns/${saleItemReturnId}",
  CONFIRM_SALE_ITEM_RETURN_URL:
    "/api/v1/sale-returns/${saleItemReturnId}/confirm-return",
  // purchases route
  PURCHASES_URL: "/api/v1/purchases",
  PURCHASE_URL: "/api/v1/purchases/${purchaseId}",
  PURCHASEPRODUCTS_URL: "/api/v1/purchases/${purchaseId}/purchase-items",
  PURCHASEPRODUCT_URL:
    "/api/v1/purchases/${purchaseId}/purchase-items/${purchaseProductId}",
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
  //purchase order routes
  PURCHASE_ORDERS_URL: "/api/v1/purchase-orders",
  PURCHASE_ORDER_URL: "/api/v1/purchase-orders/${purchaseOrderId}",
  COMPLETE_PURCHASE_ORDER_URL:
    "/api/v1/purchase-orders/${purchaseOrderId}/complete-order",
  CALCULATE_PURCHASE_ORDER_URL:
    "/api/v1/purchase-orders/${purchaseOrderId}/calculate",
  PURCHASE_ORDER_ITEMS_URL:
    "/api/v1/purchase-orders/${purchaseOrderId}/order-items",
  PURCHASE_ORDER_ITEM_URL:
    "/api/v1/purchase-orders/${purchaseOrderId}/order-items/${purchaseOrderItemId}",

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
  USER_ROLE: {
    admin: "admin",
    staff: "staff",
    cashier: "cashier",
  },
};

export default config;
