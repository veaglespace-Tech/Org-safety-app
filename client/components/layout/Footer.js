"use client";

import React from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

export default function Footer({ forceShow = false }) {
  const { user } = useSelector((state) => state.auth);
  const pathname = usePathname();

  const isDashboardRoute = 
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/org") ||
    pathname?.startsWith("/member") ||
    pathname?.startsWith("/team-leader") ||
    (pathname?.startsWith("/admin") && pathname !== "/admin/login");

  if (!forceShow && isDashboardRoute) {
    return null;
  }
  const orgName = user?.organizations?.name || user?.organization?.name || "ढोल - ताशा महासंघ";

  return (
    <>
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4 mt-auto mb-6">
        <a href="https://www.shivmudrapathakpune.com/" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-200 font-bold tracking-wide text-center hover:underline transition-colors hover:text-blue-600 dark:hover:text-blue-400">
          Powered By - &quot;शिवमुद्रा ढोल ताशा पथक,पुणे&quot;
        </a>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700 font-bold">•</span>
        <a href="tel:+919225241608" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          <span>📞 Helpline & Support:</span>
          <span className="font-mono font-black">+91 92252 41608</span>
        </a>
      </div>
      <footer id="dashboard-footer" className="w-full pt-4 pb-6 border-t border-border bg-background flex flex-col items-center justify-center gap-2 shrink-0">
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-widest text-center px-4 w-full max-w-full break-words whitespace-normal leading-relaxed">
          Designed &amp; Developed by <a href="https://veaglespace.com/" target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors hover:text-blue-600 dark:hover:text-blue-400">Veagle Space Technology Pvt. Ltd.</a>{" | © 2026 All Rights Reserved."}
        </p>
      </footer>
    </>
  );
}
