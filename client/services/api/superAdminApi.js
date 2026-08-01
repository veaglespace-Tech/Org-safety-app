import { createApi } from '@reduxjs/toolkit/query/react';
import { buildBaseQuery } from './baseApi';

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: buildBaseQuery(),
  tagTypes: ['Stats', 'Organizations', 'Users'],
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/super-admin/stats',
      providesTags: ['Stats'],
    }),
    getOrganizations: builder.query({
      query: () => '/super-admin/organizations',
      providesTags: ['Organizations'],
    }),
    getOrganizationById: builder.query({
      query: (id) => `/super-admin/organizations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Organizations', id }],
    }),
    getUsers: builder.query({
      query: () => '/super-admin/users',
      providesTags: ['Users'],
    }),
    deleteSuperAdminUser: builder.mutation({
      query: (id) => ({
        url: `/super-admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Users', 'Organizations'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useGetUsersQuery,
  useDeleteSuperAdminUserMutation,
} = superAdminApi;
