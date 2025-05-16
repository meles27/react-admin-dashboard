import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create user socket event
 */
export function emitCreateUserEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.USER_CREATE,
    entity: "user",
    status: "success",
    message: "user is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh user socket event
 */
export function emitRefreshUserEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.USER_REFRESH,
    entity: "user",
    status: "success",
    message: "refresh user",
    count: 0,
    data: [],
  });
}
/**
 * update user socket event
 */
export function emitUpdateUserEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.USER_UPDATE,
    entity: "user",
    status: "success",
    message: "user is updated successfully",
    count: data.length,
    data: data,
  });
}

/**
 * update user socket event
 */
export function emitChangeUserRoleEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.USER_CHANGE_ROLE,
    entity: "user",
    status: "success",
    message: "user role is changed successfully",
    count: data.length,
    data: data,
  });
}
/**
 * update user socket event
 */
export function emitChangeUserStatusEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.USER_CHANGE_STATUS,
    entity: "user",
    status: "success",
    message: "user status successfully changed",
    count: data.length,
    data: data,
  });
}
/**
 * delete user socket event
 */
export function emitDeleteUserEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.USER_DELETE,
    entity: "user",
    status: "success",
    message: "user is deleted successfully",
    count: data.length,
    data,
  });
}
