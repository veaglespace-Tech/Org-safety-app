"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateMeMutation } from "@/services/api/authApi";
import { setCurrentUser } from "@/store/slices/authSlice";
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle2, Shield } from "lucide-react";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";

export default function SuperAdminSettings() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const response = await updateMe(payload).unwrap();
      dispatch(setCurrentUser(response.user));
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: "error", text: err?.data?.error || "Failed to update profile." });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-500 mt-2">Manage your personal information and password.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-500/20">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Super Admin Account</h2>
            <p className="text-sm text-slate-500 mt-0.5">Update your credentials here.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
              {message.type === 'success' && <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password (leave blank to keep current)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      
      <DeleteAccountSection type="user" />
    </div>
  );
}
