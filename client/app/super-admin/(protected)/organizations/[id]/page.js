"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetOrganizationByIdQuery } from "@/services/api/superAdminApi";
import { Users, Mail, Phone, ChevronLeft, Building2, MapPin } from "lucide-react";
import { ROLE_LABELS } from "@/utils/roles";

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useGetOrganizationByIdQuery(id);

  if (isLoading) return <div className="p-8">Loading organization details...</div>;

  const org = data?.organization;

  if (!org) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organization not found</h2>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  const users = org.users || [];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-black text-white dark:bg-white dark:text-black";
      case "admin":
      case "ORG_ADMIN":
      case "SUPER_ADMIN":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div>
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          Back to Organizations
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Building2 size={32} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{org.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Mail size={14}/> {org.email}</span>
              <span className="flex items-center gap-1"><Phone size={14}/> {org.phone}</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> {org.city}, {org.state}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organization Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <th className="p-4">User Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No users found in this organization.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                          <Users size={20} />
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div>
                        {user.phone && <div className="flex items-center gap-2"><Phone size={14}/> {user.phone}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
