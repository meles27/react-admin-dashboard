import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create order socket event
 */
export function emitCreateSaleOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_CREATE,
    entity: "sale_order",
    status: "success",
    message: "order is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh order socket event
 */
export function emitRefreshSaleOrderEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_REFRESH,
    entity: "sale_order",
    status: "success",
    message: "refresh order",
    count: 0,
    data: [],
  });
}
/**
 * update order socket event
 */
export function emitUpdateSaleOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_UPDATE,
    entity: "sale_order",
    status: "success",
    message: "order is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete order socket event
 */
export function emitDeleteSaleOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_DELETE,
    entity: "sale_order",
    status: "success",
    message: "order is deleted successfully",
    count: data.length,
    data,
  });
}
/**
 * complete order socket event
 */
export function emitCompleteSaleOrderEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_COMPLETE,
    entity: "sale_order",
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
export function emitCreateSaleOrderItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_ITEM_CREATE,
    entity: "sale_order_item",
    status: "success",
    message: "order_item is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh order_item socket event
 */
export function emitRefreshSaleOrderItemEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_ITEM_REFRESH,
    entity: "sale_order_item",
    status: "success",
    message: "refresh order_item",
    count: 0,
    data: [],
  });
}
/**
 * update order_item socket event
 */
export function emitUpdateSaleOrderItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_ITEM_UPDATE,
    entity: "sale_order_item",
    status: "success",
    message: "order_item is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete order_item socket event
 */
export function emitDeleteSaleOrderItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ORDER_ITEM_DELETE,
    entity: "sale_order_item",
    status: "success",
    message: "order_item is deleted successfully",
    count: data.length,
    data,
  });
}
