"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMembersQuery } from "@/services/api/authApi";
import { useDeleteOrgUserMutation } from "@/services/api/orgApi";
import { Copy, CheckCircle2, Users, Calendar, Shield, Bell, ChevronRight, Activity, User, Building2 } from "lucide-react";
import Link from "next/link";
import UserDetailsModal from "@/components/org/UserDetailsModal";
import UserModal from "@/components/org/UserModal";
import { toast } from "react-hot-toast";

export default function OrgDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetMembersQuery();
  const [deleteOrgUser] = useDeleteOrgUserMutation();

  const [copied, setCopied] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const handleEdit = (member) => {
    setSelectedMember(null);
    setEditingMember(member);
  };

  const handleDelete = async (member) => {
    if (!user || member?.id === user?.id) {
      toast.error("You cannot delete yourself.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${member?.name}?`)) {
      try {
        await deleteOrgUser(member.id).unwrap();
        toast.success("User deleted successfully");
        setSelectedMember(null);
        refetch();
      } catch (err) {
        toast.error(err?.data?.error || "Failed to delete user");
      }
    }
  };

  // Generate referral link using the organization ID
  const referralCode = user?.organization_id ? `REF-${String(user?.organization_id).padStart(8, '0')}` : '';
  const referralLink = typeof window !== 'undefined' && referralCode
    ? `${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/register/user?ref=${referralCode}`
    : '';

  const handleCopyLink = () => {
    if (!referralLink) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(referralLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error("Clipboard copy failed:", err));
    } else {
      // Fallback for HTTP (non-secure context) where clipboard API is disabled by browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }
  };

  const members = data?.members || [];

  return (
    <div className="page-shell relative min-h-screen px-4 md:px-8 py-8 transition-colors duration-500">
      {/* Background decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="page-shell-orb-primary absolute left-[-6%] top-24 h-80 w-80 rounded-full blur-[120px]" />
        <div className="page-shell-orb-secondary absolute right-[-8%] top-36 h-72 w-72 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10">

        {/* Organization Banner Section */}
        <div className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 mb-8 border border-slate-200/50 dark:border-slate-800/50">
          <div className="relative z-10">
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-5 mb-8 text-center sm:text-left">
              <div className="flex flex-col items-center sm:items-start">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-slate-950 dark:text-white tracking-tight">
                  {user?.organizations?.name || user?.organization?.name || "ढोल - ताशा महासंघ"}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-xl text-base sm:text-lg leading-relaxed font-medium">
                  Here you can manage your {user?.organizations?.name || user?.organization?.name || "organization's"} members and share your referral link to instantly add new people to your organization.
                </p>
              </div>
              <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-200/80 dark:border-slate-700 shrink-0 overflow-hidden relative">
                {user?.organizations?.logo || user?.organization?.logo ? (
                  <img
                    src={user?.organizations?.logo || user?.organization?.logo}
                    alt="Organization Logo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="surface-card rounded-[1.5rem] p-6 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Users size={20} />
                  </div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Users</h3>
                </div>
                <p className="text-4xl font-black text-slate-950 dark:text-white pl-1">{members.length}</p>
              </div>

              {/* Referral Link Box */}
              <div className="md:col-span-2 surface-card rounded-[1.5rem] p-6 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Share your referral code or link</h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                    <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Code:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{referralCode}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none font-medium text-sm shadow-inner"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="surface-card rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Users size={20} className="text-blue-500"/> Organization Members
            </h2>
            <button
              onClick={() => { setSelectedMember(null); setEditingMember({}); }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm whitespace-nowrap self-start sm:self-auto"
            >
              + Add Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-xs tracking-widest">
                <tr>
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-medium">
                      Loading members...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-medium">
                      No members found. Share your referral link to add some!
                    </td>
                  </tr>
                ) : (
                  members.map((member, idx) => (
                    <tr
                      key={member?.id || idx}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                      onClick={() => member && setSelectedMember(member)}
                    >
                      <td className="px-8 py-5 font-bold text-slate-950 dark:text-white text-base">{member?.name || 'Unknown'}</td>
                      <td className="px-8 py-5">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{member?.email || ''}</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-500">{member?.phone || 'No phone'}</div>
                      </td>
                      <td className="px-8 py-5">
                        {member?.role && (
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            member.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          }`}>
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {member?.created_at ? new Date(member.created_at).toLocaleDateString() : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserDetailsModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        user={selectedMember}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserModal
        isOpen={!!editingMember}
        onClose={() => { setEditingMember(null); refetch(); }}
        user={editingMember}
      />
    </div>
  );
}
