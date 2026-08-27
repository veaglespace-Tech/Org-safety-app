"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Shield, Bell, Calendar, ChevronRight, Share2, MessageCircle, Mail, Copy, Check, User, Building2 } from "lucide-react";
import Link from "next/link";
import { ROLE_LABELS, normalizeRole } from "@/utils/roles";

export default function MemberDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const userRole = user?.role ? normalizeRole(user.role) : null;
  const displayRole = userRole && ROLE_LABELS[userRole] ? ROLE_LABELS[userRole] : "Member";

  const rawOrgId = user?.organization_id;
  const referralCode = rawOrgId ? `REF-${String(rawOrgId).padStart(8, '0')}` : '';
  const referralLink = `${origin}/register?ref=${referralCode}`;
  const shareText = encodeURIComponent(`Join our organization on the Safety Portal!\nRegister here: `);
  const whatsappUrl = `https://wa.me/?text=${shareText}${encodeURIComponent(referralLink)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Join our Organization Safety Portal")}&body=${shareText}${encodeURIComponent(referralLink)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="page-shell relative min-h-screen px-4 md:px-8 py-8 transition-colors duration-500 flex flex-col lg:flex-row gap-8">
      {/* Background decorative orbs (similar to register page) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="page-shell-orb-primary absolute left-[-6%] top-24 h-80 w-80 rounded-full blur-[120px]" />
        <div className="page-shell-orb-secondary absolute right-[-8%] top-36 h-72 w-72 rounded-full blur-[120px]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative z-10">

        {/* Organization Banner Section */}
        <div className="surface-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8 mb-8 border border-slate-200/50 dark:border-slate-800/50">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200/60 dark:border-slate-700 shrink-0 overflow-hidden relative">
              {user?.organizations?.logo || user?.organization?.logo ? (
                <img
                  src={user?.organizations?.logo || user?.organization?.logo}
                  alt="Organization Logo"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-slate-950 dark:text-white tracking-tight">
                {user?.organizations?.name || user?.organization?.name || "ढोल - ताशा महासंघ"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-xl text-base sm:text-lg leading-relaxed font-medium">
                Check out your organization's updates, view your team members, and manage your safety securely.
              </p>
            </div>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="surface-card rounded-[1.5rem] p-6 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-center mb-8">
          <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Share your referral code or link</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner inline-flex w-max">
              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Code:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{referralCode || 'Loading...'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              value={origin ? referralLink : 'Loading link...'}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none font-medium text-sm shadow-inner"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
