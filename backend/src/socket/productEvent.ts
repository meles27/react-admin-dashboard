import { Server } from "socket.io";
import { emitSocketEvent, SOCKET_EVENT } from "./base";

/**
 * create product socket event
 */
export function emitCreateProductEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_CREATE,
    entity: "product",
    status: "success",
    message: "product is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh product socket event
 */
export function emitRefreshProductEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_REFRESH,
    entity: "product",
    status: "success",
    message: "refresh product",
    count: 0,
    data: [],
  });
}
/**
 * update product socket event
 */
export function emitUpdateProductEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_UPDATE,
    entity: "product",
    status: "success",
    message: "product is created successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete product socket event
 */
export function emitDeleteProductEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_DELETE,
    entity: "product",
    status: "success",
    message: "product is deleted successfully",
    count: data.length,
    data,
  });
}

/**
 * create product_Variant socket event
 */
export function emitCreateProductVariantEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_VARIANT_CREATE,
    entity: "product_variant",
    status: "success",
    message: "product_variant is created successfully",
    count: data.length,
    data,
  });
}
/**
 * refresh product_Variant socket event
 */
export function emitRefreshProductVariantEvent<T>(io: Server) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_VARIANT_REFRESH,
    entity: "product_variant",
    status: "success",
    message: "refresh product_Variant",
    count: 0,
    data: [],
  });
}
/**
 * update product_Variant socket event
 */
export function emitUpdateProductVariantEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_VARIANT_UPDATE,
    entity: "product_variant",
    status: "success",
    message: "product_variant is updated successfully",
    count: data.length,
    data: data,
  });
}
/**
 * delete product_Variant socket event
 */
export function emitDeleteProductVariantEvent<T>(io: Server, data: T[]) {
  return emitSocketEvent({
    io,
    eventName: SOCKET_EVENT.PRODUCT_VARIANT_DELETE,
    entity: "product_variant",
    status: "success",
    message: "product_variant is deleted successfully",
    count: data.length,
    data,
  });
}
