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
    (pathname?.startsWith("/super-admin") && pathname !== "/super-admin/login");

  if (!forceShow && isDashboardRoute) {
    return null;
  }
  
  return (
    <footer id="app-footer" className="w-full mt-2 shrink-0 flex flex-col items-center">
      {/* Powered By Banner */}
      <a 
        href="https://www.shivmudrapathakpune.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-full flex items-center justify-center px-4 py-2 mb-2 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-sm hover:opacity-90 transition-opacity"
      >
        <span className="text-[13px] sm:text-[14px] font-bold text-white tracking-wide text-center">
          Powered By –{' '}
          <span className="text-[#38BDF8] underline font-bold">
            &quot;शिवमुद्रा ढोल ताशा पथक,पुणे&quot;
          </span>
        </span>
      </a>

      {/* Copyright & Dev Credit */}
      <div className="pt-1.5 pb-2 w-full flex flex-col items-center justify-center border-t border-slate-200/50 dark:border-slate-800/80">
        <a
          href="https://veaglespace.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 flex flex-col items-center hover:opacity-90 transition-opacity"
        >
          <span className="text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed">
            Designed & Developed by{' '}
            <span className="text-blue-500 dark:text-[#38BDF8] underline">
              Veagle Space Technology Pvt. Ltd.
            </span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-400/80 dark:text-slate-500 font-medium mt-0.5 text-center">
            © 2026 All Rights Reserved.
          </span>
        </a>
      </div>
    </footer>
  );
}
