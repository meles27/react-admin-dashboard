import { PaginatedResponseIface } from "@/types";

export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  offset: number,
  limit: number
): PaginatedResponseIface<T> {
  const pageCount = Math.ceil(totalCount / limit);
  return {
    count: totalCount,
    next: offset < pageCount ? `/api/products?page=${offset + 1}` : null,
    previous: offset > 1 ? `/api/products?page=${offset - 1}` : null,
    results: data,
  };
}
