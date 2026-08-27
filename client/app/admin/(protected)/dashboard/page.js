"use client";

import React, { useState } from "react";
import { useGetStatsQuery, useGetOrganizationsQuery, useDeleteOrganizationMutation } from "@/services/api/superAdminApi";
import { Building2, Users, ShieldAlert, Mail, Phone, MapPin, ChevronRight, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ExportButtons from "@/components/ui/ExportButtons";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: statsData, isLoading: isLoadingStats } = useGetStatsQuery();
  const { data: orgData, isLoading: isLoadingOrgs } = useGetOrganizationsQuery();
  const [deleteOrganization] = useDeleteOrganizationMutation();

  const handleDelete = async (e, orgId, orgName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${orgName}? When this organization is deleted, all users under it and their data will also be permanently deleted.`)) {
      try {
        await deleteOrganization(orgId).unwrap();
      } catch (err) {
        console.error("Failed to delete organization:", err);
        alert("Failed to delete organization.");
      }
    }
  };

  if (isLoadingStats || isLoadingOrgs) return <div className="p-8">Loading dashboard...</div>;

  const orgs = orgData?.organizations || [];
  
  const filteredOrgs = orgs.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const orgColumns = [
    { header: "Organization Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Phone", key: "phone" },
    { header: "City", key: "city" },
    { header: "State", key: "state" },
    { header: "Country", key: "country" },
    { header: "Users Count", value: (row) => row._count?.users || 0 },
    { header: "Registered Date", value: (row) => new Date(row.created_at).toLocaleDateString() }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Super Admin Overview</h1>
        <p className="text-slate-500 mt-2">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/admin/organizations" 
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform`}>
            <Building2 size={32} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Organizations</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{statsData?.organizations || 0}</h2>
          </div>
        </Link>
      </div>
      
      <div className="mt-12 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Organizations</h2>
            <ExportButtons data={filteredOrgs} columns={orgColumns} filename="Organizations" />
          </div>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:text-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/20">
            {filteredOrgs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                No organizations found.
              </div>
            ) : (
              filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  onClick={() => router.push(`/admin/organizations/${org.id}`)}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
                >
                  <div className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-500/20">
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Building2 size={24} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{org.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{org.city}, {org.state}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                        <Users size={12} className="shrink-0" />
                        <span>{org._count?.users || 0} Users</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, org.id, org.name)}
                      className="p-2 -mt-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      title="Delete Organization"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={18} className="text-slate-400 shrink-0 mt-1" />
                  </div>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Mail size={14} className="text-slate-400" />
                        <span className="truncate max-w-[150px]">{org.email}</span>
                      </div>
                      <span className="text-slate-400 font-medium">{new Date(org.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone size={14} className="text-slate-400" />
                      {org.phone}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <th className="p-4">Organization</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No organizations found.</td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr 
                      key={org.id} 
                      onClick={() => router.push(`/admin/organizations/${org.id}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            {org.logo ? (
                              <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Building2 size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{org.name}</div>
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                              <Users size={12} /> {org._count?.users || 0} Users
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2"><Mail size={14}/> {org.email}</div>
                          <div className="flex items-center gap-2"><Phone size={14}/> {org.phone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                          <MapPin size={14} className="mt-0.5 shrink-0"/> 
                          <span className="truncate">{org.city}, {org.state}, {org.country}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => handleDelete(e, org.id, org.name)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Organization"
                          >
                            <Trash2 size={18} />
                          </button>
                          <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors inline-block" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
