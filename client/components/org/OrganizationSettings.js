"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Building2, Save, Loader2, Image as ImageIcon, MapPin, Mail, Phone, Upload } from "lucide-react";
import { orgApi } from "@/services/api/orgApi";
import { setCurrentUser } from "@/store/slices/authSlice";

export default function OrganizationSettings() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const organization = user?.organization || user?.organizations;

  const [updateOrgDetails, { isLoading: isUpdatingDetails }] = orgApi.useUpdateOrgDetailsMutation();
  const [updateOrgLogo, { isLoading: isUpdatingLogo }] = orgApi.useUpdateOrgLogoMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: ""
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [logoStatus, setLogoStatus] = useState("idle");

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        email: organization.email || "",
        phone: organization.phone || "",
        address: organization.address || "",
        city: organization.city || "",
        state: organization.state || "",
        country: organization.country || ""
      });
      if (organization.logo) {
        setLogoPreview(organization.logo);
      }
    }
  }, [organization]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    
    try {
      setLogoStatus("uploading");
      const formData = new FormData();
      formData.append("logo", logoFile);
      
      const response = await updateOrgLogo(formData).unwrap();
      
      // Update Redux state with new org logo
      if (response.organization) {
        dispatch(setCurrentUser({
          ...user,
          organization: response.organization,
          organizations: response.organization
        }));
      }
      
      setLogoStatus("success");
      setTimeout(() => setLogoStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to upload logo:", error?.data || error?.message || error);
      setLogoStatus("error");
      setTimeout(() => setLogoStatus("idle"), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus("saving");
      const response = await updateOrgDetails(formData).unwrap();
      
      if (response.organization) {
        dispatch(setCurrentUser({
          ...user,
          organization: response.organization,
          organizations: response.organization
        }));
      }
      
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to update organization details:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  if (!organization) return null;

  return (
    <div className="space-y-8">
      {/* Logo Upload Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          Organization Logo
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center relative group shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Organization Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            )}
            
            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="w-6 h-6 text-white mb-1" />
              <span className="text-xs font-medium text-white">Change</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Upload new logo</p>
              <p className="text-xs text-slate-500 mt-1">Recommended size: 256x256px. Max file size: 2MB.</p>
            </div>
            
            {logoFile && (
              <button
                onClick={handleUploadLogo}
                disabled={isUpdatingLogo}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isUpdatingLogo ? "Uploading..." : "Save Logo"}
              </button>
            )}
            
            {logoStatus === "success" && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Logo updated successfully!</p>
            )}
            {logoStatus === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to update logo. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Details Form Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          Organization Details
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Organization Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm">
              {status === "success" && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Organization details updated
                </span>
              )}
              {status === "error" && (
                <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Failed to update
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingDetails}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isUpdatingDetails ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
