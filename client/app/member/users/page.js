"use client";

import React, { useState } from "react";
import { useGetOrgUsersQuery, useDeleteOrgUserMutation } from "@/services/api/orgApi";
import { Users, Mail, Phone, Calendar, User, Search, RefreshCw, ShieldAlert, BadgeInfo, PhoneCall, Edit2, Trash2, UserPlus } from "lucide-react";
import { ROLE_LABELS } from "@/utils/roles";
import UserModal from "@/components/org/UserModal";

export default function UsersPage() {
  const { data, isLoading, error, refetch, isFetching } = useGetOrgUsersQuery();
  const [deleteUser] = useDeleteOrgUserMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const members = data?.members || [];
  
  // Filter members by search term
  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ORG_ADMIN":
      case "admin":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
      case "SUB_ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
      case "TEAM_LEADER":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      case "LIFE_MEMBER":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert(error?.data?.error || "Failed to delete user");
      }
    }
  };

  const openNewUserModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="page-shell relative min-h-screen px-4 md:px-8 py-8 transition-colors duration-500 flex flex-col gap-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="page-shell-orb-primary absolute left-[-6%] top-24 h-80 w-80 rounded-full blur-[120px]" />
        <div className="page-shell-orb-secondary absolute right-[-8%] top-36 h-72 w-72 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col md:flex-row justify-between md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black mb-2 text-slate-950 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="text-blue-600 dark:text-blue-500" size={32} />
            Organization Users
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Manage and view all members belonging to your organization.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={openNewUserModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors w-full sm:w-auto shadow-lg shadow-blue-500/20"
          >
            <UserPlus size={18} />
            Add New User
          </button>
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
            title="Refresh Users"
          >
            <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
            <p className="font-medium">Loading users...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-rose-500">
            <ShieldAlert size={48} className="mb-4 opacity-50" />
            <p className="font-bold text-lg">Failed to load users</p>
            <p className="text-sm opacity-80 mt-1">Please try again later.</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <User size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-lg">No users found</p>
            <p className="text-sm opacity-80 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider">Email</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider">Phone</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider">Emergency Contact</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider">Role</th>
                  <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-500/30">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{member.name || "Unknown User"}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <BadgeInfo size={12} /> ID: {member.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Mail size={16} className="text-blue-500/70" />
                        {member.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Phone size={16} className="text-emerald-500/70" />
                        {member.phone || "Not provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <PhoneCall size={16} className="text-rose-500/70" />
                        {member.emergency_contact || "Not provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(member.role)}`}>
                        {ROLE_LABELS[member.role] || member.role || "Member"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
