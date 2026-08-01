import React from 'react';

export default function SidebarLogoText({ user }) {
  return (
    <div className="flex items-center justify-center hover:opacity-80 transition-opacity w-full overflow-hidden px-1">
      <h1 className="text-[18px] sm:text-[20px] md:text-[24px] font-black tracking-tight text-slate-900 dark:text-white text-center drop-shadow-md whitespace-nowrap flex items-center gap-1">
        <span>ढोल - ताशा </span>
        <span className="text-blue-600 dark:text-blue-500">महासंघ</span>
      </h1>
    </div>
  );
}
