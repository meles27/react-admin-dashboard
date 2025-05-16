import { ILike } from "typeorm";

export const ILikeQuery = (query: string) => {
  if (query) {
    return ILike(`%${query}%`);
  }
  return query;
};
