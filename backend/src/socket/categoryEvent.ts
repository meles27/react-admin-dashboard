import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

export function emitCreateCategoryEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.CATEGORY_CREATE,
    entity: "category",
    status: "success",
    message: "category is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh category socket event
 */
export function emitRefreshCategoryEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.CATEGORY_REFRESH,
    entity: "category",
    status: "success",
    message: "refresh category",
    count: 0,
    data: [],
  });
}
/**
 * update category socket event
 */
export function emitUpdateCategoryEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.CATEGORY_UPDATE,
    entity: "category",
    status: "success",
    message: "category is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete category socket event
 */
export function emitDeleteCategoryEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.CATEGORY_DELETE,
    entity: "category",
    status: "success",
    message: "category is deleted successfully",
    count: data.length,
    data,
  });
}
