import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create purchase socket event
 */
export function emitCreatePurchaseEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_CREATE,
    entity: "purchase",
    status: "success",
    message: "purchase is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh purchase socket event
 */
export function emitRefreshPurchaseEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_REFRESH,
    entity: "purchase",
    status: "success",
    message: "refresh purchase",
    count: 0,
    data: [],
  });
}
/**
 * update purchase socket event
 */
export function emitUpdatePurchaseEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_UPDATE,
    entity: "purchase",
    status: "success",
    message: "purchase is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete purchase socket event
 */
export function emitDeletePurchaseEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_DELETE,
    entity: "purchase",
    status: "success",
    message: "purchase is deleted successfully",
    count: data.length,
    data,
  });
}
/**
 * *************************************************************
 */
/**
 * create purchase_item socket event
 */
export function emitCreatePurchaseItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ITEM_CREATE,
    entity: "purchase_item",
    status: "success",
    message: "purchase_item is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh purchase_item socket event
 */
export function emitRefreshPurchaseItemEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ITEM_REFRESH,
    entity: "purchase_item",
    status: "success",
    message: "refresh purchase_item",
    count: 0,
    data: [],
  });
}
/**
 * update purchase_item socket event
 */
export function emitUpdatePurchaseItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ITEM_UPDATE,
    entity: "purchase_item",
    status: "success",
    message: "purchase_item is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete purchase_item socket event
 */
export function emitDeletePurchaseItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PURCHASE_ITEM_DELETE,
    entity: "purchase_item",
    status: "success",
    message: "purchase_item is deleted successfully",
    count: data.length,
    data,
  });
}
