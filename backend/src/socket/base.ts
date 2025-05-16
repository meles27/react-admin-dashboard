import { Server } from "socket.io";

export enum SOCKET_EVENT {
  /**
   * user change events
   */
  USER_CREATE = "user_create",
  USER_UPDATE = "user_update",
  USER_DELETE = "user_delete",
  USER_REFRESH = "user_refresh",
  USER_CHANGE_ROLE = "user_change_role",
  USER_CHANGE_STATUS = "user_change_status",
  /**
   * inventory change events
   */
  INVENTORY_CREATE = "inventory_create",
  INVENTORY_UPDATE = "inventory_update",
  INVENTORY_DELETE = "inventory_delete",
  INVENTORY_REFRESH = "inventory_refresh",
  /**
   * category change events
   */
  CATEGORY_CREATE = "category_create",
  CATEGORY_UPDATE = "category_update",
  CATEGORY_DELETE = "category_delete",
  CATEGORY_REFRESH = "category_refresh",
  /**
   * product change events
   */
  PRODUCT_CREATE = "product_create",
  PRODUCT_UPDATE = "product_update",
  PRODUCT_DELETE = "product_delete",
  PRODUCT_REFRESH = "product_refresh",
  /**
   * product variant change events
   */
  PRODUCT_VARIANT_CREATE = "product_variant_create",
  PRODUCT_VARIANT_UPDATE = "product_variant_update",
  PRODUCT_VARIANT_DELETE = "product_variant_delete",
  PRODUCT_VARIANT_REFRESH = "product_variant_refresh",
  /**
   * sale_Order change events
   */
  SALE_ORDER_CREATE = "sale_order_create",
  SALE_ORDER_UPDATE = "sale_order_update",
  SALE_ORDER_DELETE = "sale_order_delete",
  SALE_ORDER_REFRESH = "sale_order_refresh",
  SALE_ORDER_COMPLETE = "sale_order_complete",
  /**
   * sale_Order item change events
   */
  SALE_ORDER_ITEM_CREATE = "sale_order_item_create",
  SALE_ORDER_ITEM_UPDATE = "sale_order_item_update",
  SALE_ORDER_ITEM_DELETE = "sale_order_item_delete",
  SALE_ORDER_ITEM_REFRESH = "sale_order_item_refresh",
  /**
   * sale variant change events
   */
  SALE_CREATE = "sale_create",
  SALE_UPDATE = "sale_update",
  SALE_DELETE = "sale_delete",
  SALE_REFRESH = "sale_refresh",
  /**
   * sale item change events
   */
  SALE_ITEM_CREATE = "sale_item_create",
  SALE_ITEM_UPDATE = "sale_item_update",
  SALE_ITEM_DELETE = "sale_item_delete",
  SALE_ITEM_REFRESH = "sale_item_refresh",
  /**
   * sale item return change events
   */
  SALE_ITEM_RETURN_CREATE = "sale_item_return_create",
  SALE_ITEM_RETURN_UPDATE = "sale_item_return_update",
  SALE_ITEM_RETURN_DELETE = "sale_item_return_delete",
  SALE_ITEM_RETURN_REFRESH = "sale_item_return_refresh",
  SALE_ITEM_RETURN_CONFIRM = "sale_item_return_confirm",
  /**
   * purchase_order change events
   */
  PURCHASE_ORDER_CREATE = "purchase_order_create",
  PURCHASE_ORDER_UPDATE = "purchase_order_update",
  PURCHASE_ORDER_DELETE = "purchase_order_delete",
  PURCHASE_ORDER_REFRESH = "purchase_order_refresh",
  PURCHASE_ORDER_COMPLETE = "purchase_order_complete",
  /**
   * purchase_order item change events
   */
  PURCHASE_ORDER_ITEM_CREATE = "purchase_order_item_create",
  PURCHASE_ORDER_ITEM_UPDATE = "purchase_order_item_update",
  PURCHASE_ORDER_ITEM_DELETE = "purchase_order_item_delete",
  PURCHASE_ORDER_ITEM_REFRESH = "purchase_order_item_refresh",

  /**
   * purchase change events
   */
  PURCHASE_CREATE = "purchase_create",
  PURCHASE_UPDATE = "purchase_update",
  PURCHASE_DELETE = "purchase_delete",
  PURCHASE_REFRESH = "purchase_refresh",
  /**
   * purchase item change events
   */
  PURCHASE_ITEM_CREATE = "purchase_item_create",
  PURCHASE_ITEM_UPDATE = "purchase_item_update",
  PURCHASE_ITEM_DELETE = "purchase_item_delete",
  PURCHASE_ITEM_REFRESH = "purchase_item_refresh",
}

// Define types for event status and event type
type EventStatus = "success" | "error";
type EventType = "created" | "updated" | "deleted" | "error";

// Conditional type: If status is "error", data must be null
type SocketEvent<T, S extends EventStatus> = {
  event: SOCKET_EVENT;
  status: S;
  count: number;
  entity: string;
  data: S extends "error" ? null : T[]; // Enforce `null` only for "error" status
  timestamp: string;
  message: string;
};

// Define an interface for function parameters
interface EmitSocketEventParams<T, S extends EventStatus> {
  io: Server;
  eventName: SOCKET_EVENT;
  entity: string;
  count: number;
  data: S extends "error" ? null : T[];
  status: S;
  message: string;
}

// Function to emit socket events with type safety
export function emitSocketEvent<T, S extends EventStatus>({
  io,
  eventName,
  entity,
  data,
  count,
  status,
  message,
}: EmitSocketEventParams<T, S>): void {
  const response: SocketEvent<T, S> = {
    // event: eventName.replace(/([A-Z])/g, "_$1").toLowerCase() as EventType, // Convert to snake_case
    event: eventName,
    status,
    entity,
    data,
    count,
    timestamp: new Date().toISOString(),
    message,
  };
  try {
    io.emit(eventName, response);
  } catch (error) {
    handleError(
      io,
      entity,
      error.message || "Warning: Failed to emit socket event"
    );
  }
}

// Example of error handling
export function handleError(io: Server, entity: string, errorMessage: string) {
  emitSocketEvent({
    io,
    eventName: `${entity}Error` as SOCKET_EVENT,
    entity,
    count: 0,
    data: null, // Enforced to be null when status is "error"
    status: "error",
    message: errorMessage,
  });
}
