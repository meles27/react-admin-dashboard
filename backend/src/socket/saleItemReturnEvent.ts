import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create sale_item_return socket event
 */
export function emitCreateSaleItemReturnEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_RETURN_CREATE,
    entity: "sale_item_return",
    status: "success",
    message: "sale item return is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh sale_item return socket event
 */
export function emitRefreshSaleItemReturnEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_RETURN_REFRESH,
    entity: "sale_item_return",
    status: "success",
    message: "refresh sale item return",
    count: 0,
    data: [],
  });
}
/**
 * update sale_item return socket event
 */
export function emitUpdateSaleItemReturnEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_RETURN_UPDATE,
    entity: "sale_item_return",
    status: "success",
    message: "sale item return is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete sale_item return socket event
 */
export function emitDeleteSaleItemReturnEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_RETURN_DELETE,
    entity: "sale_item_return",
    status: "success",
    message: "sale item return is deleted successfully",
    count: data.length,
    data,
  });
}
/**
 * confirm sale_item return socket event
 */
export function emitConfirmSaleItemReturnEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.SALE_ITEM_RETURN_CONFIRM,
    entity: "sale_item_return",
    status: "success",
    message: "return is confirmed successfully",
    count: data.length,
    data,
  });
}
