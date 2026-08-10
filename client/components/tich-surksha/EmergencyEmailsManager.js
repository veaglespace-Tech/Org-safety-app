"use client";

import React, { useState } from "react";
import { Plus, Trash2, MailWarning, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  useGetEmergencyEmailsQuery, 
  useAddEmergencyEmailMutation, 
  useDeleteEmergencyEmailMutation 
} from "@/services/api/orgApi";

export default function EmergencyEmailsManager() {
  const { data, isLoading } = useGetEmergencyEmailsQuery();
  const [addEmail, { isLoading: isAdding }] = useAddEmergencyEmailMutation();
  const [deleteEmail, { isLoading: isDeleting }] = useDeleteEmergencyEmailMutation();
  
  const [newEmail, setNewEmail] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const emails = data?.emails || [];

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    
    try {
      await addEmail({ email: newEmail }).unwrap();
      toast.success("Emergency email added successfully");
      setNewEmail("");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.error || error?.message || "Failed to add email");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this emergency email?")) return;
    setDeletingId(id);
    try {
      await deleteEmail(id).unwrap();
      toast.success("Emergency email removed");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.error || error?.message || "Failed to delete email");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MailWarning className="text-rose-500" />
            Emergency SOS Emails
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Add email addresses that should automatically receive your SOS alert with your live location.
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-500/20">
          Max 10 emails
        </div>
      </div>

      <form onSubmit={handleAddEmail} className="flex gap-3 mb-8">
        <input
          type="email"
          placeholder="Enter emergency email address..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium placeholder-slate-400"
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding || !newEmail}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isAdding ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
          <span className="hidden sm:inline">Add Email</span>
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Emergency Emails</h3>
          <p className="text-sm text-slate-500 mt-1">You haven't added any emergency emails yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center">
                  <MailWarning size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{email.email}</p>
                  <p className="text-xs text-slate-500">Added on {new Date(email.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(email.id)}
                disabled={deletingId === email.id || isDeleting}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Remove email"
              >
                {deletingId === email.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
