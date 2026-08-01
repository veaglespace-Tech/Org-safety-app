"use client";

import React from "react";
import { useGetStatsQuery } from "@/services/api/superAdminApi";
import { Building2, Users, ShieldAlert } from "lucide-react";

export default function SuperAdminDashboard() {
  const { data, isLoading } = useGetStatsQuery();

  if (isLoading) return <div className="p-8">Loading stats...</div>;

  const stats = [
    { title: "Total Organizations", value: data?.organizations || 0, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Users", value: data?.users || 0, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Admins", value: data?.admins || 0, icon: ShieldAlert, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Super Admin Overview</h1>
        <p className="text-slate-500 mt-2">Platform-wide statistics and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={32} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{s.title}</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{s.value}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
