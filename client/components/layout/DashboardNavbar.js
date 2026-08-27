"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/store/slices/authSlice";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function DashboardNavbar({ onToggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 md:hidden">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        
        <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-1"></div>
        
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-indigo-100/80 dark:border-indigo-800/50 rounded-[2rem] py-1.5 px-1.5 sm:px-4 sm:py-1.5 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.2)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] transition-all duration-300">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 leading-none">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mt-1.5">
              {user?.role === 'admin' ? 'Admin Portal' : user?.role === 'super_admin' ? 'Super Admin' : (user?.role || 'Member')}
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border-2 border-white dark:border-slate-900 ring-2 ring-indigo-100 dark:ring-indigo-900/50 flex items-center justify-center overflow-hidden shrink-0 shadow-md relative">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            )}
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="ml-1 flex items-center justify-center w-10 h-10 text-rose-500 dark:text-rose-400 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-500/10 dark:to-orange-500/10 hover:from-rose-100 hover:to-orange-100 dark:hover:from-rose-500/20 dark:hover:to-orange-500/20 rounded-full border border-rose-200/60 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all duration-300 shadow-[0_4px_15px_-3px_rgba(244,63,94,0.15)] hover:shadow-[0_6px_20px_-3px_rgba(244,63,94,0.25)] hover:-translate-y-0.5 active:translate-y-0"
          title="Logout"
        >
          <LogOut size={18} strokeWidth={2.5} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}
