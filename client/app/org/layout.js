"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShieldAlert, UserCog, MailWarning } from "lucide-react";
import { useSelector } from "react-redux";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import SidebarLogoText from "@/components/layout/SidebarLogoText";
import { usePathname } from "next/navigation";

export default function OrgLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: "Dashboard", href: "/org/dashboard", icon: LayoutDashboard },
    { name: "तिची सुरक्षा", href: "/org/tich-surksha", icon: ShieldAlert },
    { name: "Emergency Emails", href: "/org/emergency-emails", icon: MailWarning },
    { name: "Profile Settings", href: "/org/profile", icon: UserCog },
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

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 border ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-md shadow-blue-500/20 border-transparent hover:shadow-lg hover:-translate-y-0.5"
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

      {/* Main content */}
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


