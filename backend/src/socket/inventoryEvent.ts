import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create inventory socket event
 */
export function emitCreateInventoryEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.INVENTORY_CREATE,
    entity: "inventory",
    status: "success",
    message: "inventory is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh inventory socket event
 */
export function emitRefreshInventoryEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.INVENTORY_REFRESH,
    entity: "inventory",
    status: "success",
    message: "refresh inventory",
    count: 0,
    data: [],
  });
}
/**
 * update inventory socket event
 */
export function emitUpdateInventoryEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.INVENTORY_UPDATE,
    entity: "inventory",
    status: "success",
    message: "inventory is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete inventory socket event
 */
export function emitDeleteInventoryEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.INVENTORY_DELETE,
    entity: "inventory",
    status: "success",
    message: "inventory is deleted successfully",
    count: data.length,
    data,
  });
}
