"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '@/services/api/authApi';
import { orgApi } from '@/services/api/orgApi';
import { logout } from '@/store/slices/authSlice';

export default function DeleteAccountSection({ type = 'user' }) {
  const [deleteMe, { isLoading: isDeletingUser }] = authApi.useDeleteMeMutation();
  const [deleteOrg, { isLoading: isDeletingOrg }] = orgApi.useDeleteOrganizationMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [showConfirm, setShowConfirm] = useState(false);
  
  const isDeleting = isDeletingUser || isDeletingOrg;
  
  const handleDelete = async () => {
    try {
      if (type === 'org') {
        await deleteOrg().unwrap();
        toast.success("Organization deleted successfully");
      } else {
        await deleteMe().unwrap();
        toast.success("Account deleted successfully");
      }
      
      dispatch(logout());
      router.push('/login');
    } catch (error) {
      toast.error(error?.data?.error || error?.message || "Failed to delete account");
      setShowConfirm(false);
    }
  };
  
  return (
    <div className="mt-10 border-t border-rose-200 dark:border-rose-900/30 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-6 border border-rose-200/60 dark:border-rose-900/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-rose-600/80 dark:text-rose-300/70 text-sm mt-1">
              {type === 'org' 
                ? "Permanently delete this organization and all associated data, including users." 
                : "Permanently delete your account and all associated data."}
            </p>
          </div>
          
          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold rounded-xl transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-2 whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              {type === 'org' ? "Delete Organization" : "Delete Account"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
