import { createApi } from '@reduxjs/toolkit/query/react';
import { buildBaseQuery } from './baseApi';

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: buildBaseQuery(),
  tagTypes: ['Stats', 'Organizations', 'Users'],
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['Stats'],
    }),
    getOrganizations: builder.query({
      query: () => '/admin/organizations',
      providesTags: ['Organizations'],
    }),
    getOrganizationById: builder.query({
      query: (id) => `/admin/organizations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Organizations', id }],
    }),
    getUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['Users'],
    }),
    deleteSuperAdminUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Users', 'Organizations'],
    }),
    updateSuperAdminUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Users', 'Organizations'],
    }),
    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/admin/organizations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Organizations', 'Stats'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useGetUsersQuery,
  useDeleteSuperAdminUserMutation,
  useUpdateSuperAdminUserMutation,
  useDeleteOrganizationMutation,
} = superAdminApi;
