// Need to use the React-specific entry point to import createApi
import { createApi } from "@reduxjs/toolkit/query/react";
import config from "../config";
import axiosBaseQuery from "../utils/baseQuery/axiosBaseQuery";

// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery({ baseUrl: config.baseUrl }),
  tagTypes: ["user", "users"],
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    listUsers: builder.query({
      query: (arg) => ({
        url: config.USERS_URL,
        method: "GET",
        params: arg,
      }),
      providesTags: ["users"],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: config.USERS_URL,
        method: "POST",
        data: user,
      }),
      invalidatesTags: ["users"],
    }),
    retrieveUser: builder.query({
      query: (userId) => ({
        url: config.USER_URL.replace("${userId}", userId),
        method: "GET",
      }),
      providesTags: ["user"],
    }),
    updateUser: builder.mutation({
      query: ({ userId, user }) => ({
        url: config.USER_URL.replace("${userId}", userId),
        method: "PUT",
        data: user,
      }),
      invalidatesTags: ["user", "users"],
    }),
    destroyUser: builder.mutation({
      query: (arg) => ({
        url: config.USER_URL.replace("${userId}", arg.userId),
        method: "DELETE",
      }),
      invalidatesTags: ["user", "users"],
    }),

    changenUserRole: builder.mutation({
      query: (arg) => ({
        url: config.CHANGE_USER_ROLE_URL.replace("${userId}", arg.userId),
        method: "POST",
        data: { role: arg.role },
      }),
      invalidatesTags: ["user", "users"],
    }),

    changeUserStatus: builder.mutation({
      query: (arg) => ({
        url: config.CHANGE_USER_STATUS_URL.replace("${userId}", arg.userId),
        method: "POST",
        data: { active: arg.active },
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useListUsersQuery,
  useCreateUserMutation,
  useRetrieveUserQuery,
  useUpdateUserMutation,
  useDestroyUserMutation,
  useChangeUserStatusMutation,
  useChangenUserRoleMutation,
} = userApi;
