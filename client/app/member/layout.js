"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, ShieldAlert, UserCog, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { ROLE_LABELS, normalizeRole } from "@/utils/roles";
import Footer from "@/components/layout/Footer";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import SidebarLogoText from "@/components/layout/SidebarLogoText";

export default function MemberLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const userRole = user?.role ? normalizeRole(user.role) : null;
  const displayRole = userRole && ROLE_LABELS[userRole] ? ROLE_LABELS[userRole] : "Member";

  const navItems = [
    { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { name: "तिची सुरक्षा", href: "/member/tich-surksha", icon: ShieldAlert },
    ...(userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'admin' 
      ? [{ name: "Users", href: "/member/users", icon: Users }] 
      : []),
    { name: "Profile Settings", href: "/member/profile", icon: UserCog },
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
        <div className="flex flex-col items-center justify-center h-24 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="cursor-pointer w-full">
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white drop-shadow-sm" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout is now in DashboardNavbar */}
      </aside>

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


