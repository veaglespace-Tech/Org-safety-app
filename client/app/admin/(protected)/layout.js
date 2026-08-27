"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Building2, Users, Menu, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import SidebarLogoText from "@/components/layout/SidebarLogoText";

export default function SuperAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useSelector((state) => state.auth);
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push("/admin/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'super_admin') return null;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
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
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800/50">
          <Link href="/" className="cursor-pointer w-full block">
            <SidebarLogoText user={user} />
          </Link>


        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 border ${
                  isActive
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-500 dark:to-pink-500 text-white shadow-md shadow-rose-500/20 border-transparent hover:shadow-lg hover:-translate-y-0.5"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-rose-600 dark:hover:text-rose-400 hover:translate-x-1"
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? "text-white drop-shadow-sm" : "text-slate-400 dark:text-slate-500 group-hover:text-rose-500 transition-colors"}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout is now in DashboardNavbar */}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 overflow-y-auto w-full flex flex-col relative">
          <div className="flex-1">
            {children}
          </div>
          <Footer forceShow={true} />
        </div>
      </main>
    </div>
  );
}


