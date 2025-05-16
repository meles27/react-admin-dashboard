import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create order socket event
 */
export function emitCreatePurchaseOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_CREATE,
    entity: "purchase_order",
    status: "success",
    message: "order is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh order socket event
 */
export function emitRefreshPurchaseOrderEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_REFRESH,
    entity: "purchase_order",
    status: "success",
    message: "refresh order",
    count: 0,
    data: [],
  });
}
/**
 * update order socket event
 */
export function emitUpdatePurchaseOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_UPDATE,
    entity: "purchase_order",
    status: "success",
    message: "order is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete order socket event
 */
export function emitDeletePurchaseOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_DELETE,
    entity: "purchase_order",
    status: "success",
    message: "order is deleted successfully",
    count: data.length,
    data,
  });
}
/**
 * complete order socket event
 */
export function emitCompletePurchaseOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_COMPLETE,
    entity: "purchase_order",
    status: "success",
    message: "order is completed successfully",
    count: data.length,
    data,
  });
}
/**
 * *************************************************************
 */
/**
 * create order_item socket event
 */
export function emitCreatePurchaseOrderItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_ITEM_CREATE,
    entity: "purchase_order_item",
    status: "success",
    message: "order_item is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh order_item socket event
 */
export function emitRefreshPurchaseOrderItemEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_ITEM_REFRESH,
    entity: "purchase_order_item",
    status: "success",
    message: "refresh order_item",
    count: 0,
    data: [],
  });
}
/**
 * update order_item socket event
 */
export function emitUpdatePurchaseOrderItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_ITEM_UPDATE,
    entity: "purchase_order_item",
    status: "success",
    message: "order_item is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete order_item socket event
 */
export function emitDeletePurchaseOrderItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ORDER_ITEM_DELETE,
    entity: "purchase_order_item",
    status: "success",
    message: "order_item is deleted successfully",
    count: data.length,
    data,
  });
}
