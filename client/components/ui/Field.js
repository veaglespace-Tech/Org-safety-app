import React from "react";

export function Field({ label, icon: Icon, placeholder, error, className, children }) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <label className="ml-1 block text-[11px] font-black uppercase tracking-widest leading-none text-slate-500 dark:text-slate-300">
        {label}
      </label>
      <div className="group relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
        />
        {React.cloneElement(children, { placeholder })}
      </div>
      {error ? (
        <p className="ml-1 mt-1 text-[10px] font-black uppercase text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
