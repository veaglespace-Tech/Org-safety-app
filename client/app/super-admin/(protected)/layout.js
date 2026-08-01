"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Building2, Users, Menu } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";

export default function SuperAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push("/super-admin/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'super_admin') return null;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/super-admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/super-admin/organizations", icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 pb-2 border-b border-slate-800/50">
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="bg-rose-600 p-1.5 rounded-lg text-white">S</span>
            Super Admin
          </h1>

          <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Logged in as</span>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-sm font-bold text-rose-400 truncate tracking-wide flex-1">
                {user?.name || "System Admin"}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold group ${
                  isActive
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1/80"
                }`}
              >
                <item.icon
                  size={20}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-rose-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 font-semibold text-slate-400 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 group"
          >
            <LogOut size={20} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 md:hidden gap-4 sticky top-0 z-30">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 dark:text-white">Super Admin</span>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}


