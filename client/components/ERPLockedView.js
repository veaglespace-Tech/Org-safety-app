import React from 'react';

export default function ERPLockedView() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Feature Locked</h2>
      <p className="text-slate-600 dark:text-slate-400">This ERP feature is currently locked or under development.</p>
    </div>
  );
}
