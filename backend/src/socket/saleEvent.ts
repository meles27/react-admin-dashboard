import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create sale socket event
 */
export function emitCreateSaleEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_CREATE,
    entity: "sale",
    status: "success",
    message: "sale is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh sale socket event
 */
export function emitRefreshSaleEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_REFRESH,
    entity: "sale",
    status: "success",
    message: "refresh sale",
    count: 0,
    data: [],
  });
}
/**
 * update sale socket event
 */
export function emitUpdateSaleEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_UPDATE,
    entity: "sale",
    status: "success",
    message: "sale is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete sale socket event
 */
export function emitDeleteSaleEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_DELETE,
    entity: "sale",
    status: "success",
    message: "sale is deleted successfully",
    count: data.length,
    data,
  });
}
/**
 * *************************************************************
 */
/**
 * create sale_item socket event
 */
export function emitCreateSaleItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_CREATE,
    entity: "sale_item",
    status: "success",
    message: "sale_item is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh sale_item socket event
 */
export function emitRefreshSaleItemEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_REFRESH,
    entity: "sale_item",
    status: "success",
    message: "refresh sale_item",
    count: 0,
    data: [],
  });
}
/**
 * update sale_item socket event
 */
export function emitUpdateSaleItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_UPDATE,
    entity: "sale_item",
    status: "success",
    message: "sale_item is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete sale_item socket event
 */
export function emitDeleteSaleItemEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_DELETE,
    entity: "sale_item",
    status: "success",
    message: "sale_item is deleted successfully",
    count: data.length,
    data,
  });
}
