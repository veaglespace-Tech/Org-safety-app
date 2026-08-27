"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Phone, ShieldPlus, Save, Loader2, CheckCircle2, Mail, Lock, Building2, MapPin, Camera } from "lucide-react";
import { authApi } from "@/services/api/authApi";
import { orgApi } from "@/services/api/orgApi";
import { setCurrentUser } from "@/store/slices/authSlice";
import { toast } from "react-hot-toast";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [updateMe, { isLoading }] = authApi.useUpdateMeMutation();
  const [updateOrgDetails, { isLoading: isOrgLoading }] = orgApi.useUpdateOrgDetailsMutation();
  const [updateOrgLogo] = orgApi.useUpdateOrgLogoMutation();
  
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
    password: "",
    profilePhoto: "",
    city: "",
    gender: "",
    bloodGroup: "",
    currentAddress: "",
    permanentAddress: "",
  });

  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    logo: "",
  });

  const [orgLogoFile, setOrgLogoFile] = useState(null);

  const fileInputRef = useRef(null);
  const orgFileInputRef = useRef(null);
  const [status, setStatus] = useState("idle");

  const { data: meData } = authApi.useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  const currentUser = meData?.user || user;
  const currentOrg = currentUser?.organization;

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        emergencyContact: currentUser.emergencyContact || "",
        password: "",
        profilePhoto: currentUser.profilePhoto || "",
        city: currentUser.city || "",
        gender: currentUser.gender || "",
        bloodGroup: currentUser.bloodGroup || "",
        currentAddress: currentUser.currentAddress || "",
        permanentAddress: currentUser.permanentAddress || "",
      });
      if (currentOrg) {
        setOrgData({
          name: currentOrg.name || "",
          email: currentOrg.email || "",
          phone: currentOrg.phone || "",
          address: currentOrg.address || "",
          city: currentOrg.city || "",
          state: currentOrg.state || "",
          country: currentOrg.country || "",
          logo: currentOrg.logo || "",
        });
      }
    }
  }, [currentUser, currentOrg]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOrgChange = (e) => {
    setOrgData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrgFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      setOrgLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === "org") {
      try {
        setStatus("idle");
        
        let response = null;
        
        if (orgData.name) {
          response = await updateOrgDetails(orgData).unwrap();
        }
        
        if (orgLogoFile) {
          const form = new FormData();
          form.append("logo", orgLogoFile);
          const logoResponse = await updateOrgLogo(form).unwrap();
          if (!response) response = logoResponse;
        }
        
        if (response?.organization) {
          dispatch(setCurrentUser({
            ...currentUser,
            organization: { ...currentUser.organization, ...response.organization },
            organizations: { ...currentUser.organization, ...response.organization }
          }));
        }
        
        setStatus("success");
        toast.success("Organization updated successfully!");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        console.error("Failed to update org", err);
        setStatus("error");
        toast.error("Failed to update organization.");
        setTimeout(() => setStatus("idle"), 3000);
      }
      return;
    }

    try {
      setStatus("idle");
      const response = await updateMe(formData).unwrap();
      
      dispatch(setCurrentUser(response.user));
      
      setStatus("success");
      toast.success("Profile updated successfully!");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to update profile", err?.message ? err.message : JSON.stringify(err));
      setStatus("error");
      toast.error(err?.data?.error || err?.message || "Failed to update profile.");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 relative">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
          <div className="p-4 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-[1.5rem] text-indigo-600 dark:text-indigo-400 shadow-[0_8px_30px_-5px_rgba(99,102,241,0.2)]">
            <User className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
          </div>
          Account Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-4 text-base sm:text-lg font-bold tracking-wide">
          Update your personal details, organization info, and system preferences.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl mb-10 max-w-md mx-auto sm:mx-0 shadow-inner backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 gap-1 sm:gap-0">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-black tracking-wide text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
            activeTab === "profile" 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.3)]" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <User className="w-4 h-4" strokeWidth={3} />
          ADMIN PROFILE
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("org")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-black tracking-wide text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
            activeTab === "org" 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.3)]" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" strokeWidth={3} />
          ORGANIZATION
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/40 via-purple-200/40 to-rose-200/40 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-rose-900/30 rounded-[3rem] blur-2xl opacity-70"></div>
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-10 md:p-12 border border-white/60 dark:border-slate-800 shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.3)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Profile Photo Uploader */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 mb-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 rounded-[1.5rem] border-4 border-white dark:border-slate-900 ring-[6px] ring-indigo-50 dark:ring-indigo-500/10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-500/30">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-indigo-900/50 rounded-[1.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                    <Camera className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform duration-300 mb-1" />
                    <span className="text-white text-xs font-bold tracking-widest uppercase">Upload</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left pt-2">
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Picture</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-[250px] leading-relaxed">
                    Make sure the image is high resolution. JPG, PNG or GIF (Max 2MB).
                  </p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 px-6 py-2.5 rounded-xl text-sm font-black tracking-wide text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-[0_5px_15px_rgba(0,0,0,0.2)] dark:shadow-[0_5px_15px_rgba(255,255,255,0.2)] hover:shadow-lg transition-all active:scale-95 border-2 border-transparent hover:border-slate-400">
                    CHOOSE PHOTO
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
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
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    New Password (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Leave blank to keep current password"
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
                      type="text"
                      name="phone"
                      required
                      value={formData.phone || ""}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup || ""}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Current Address
                  </label>
                  <textarea
                    name="currentAddress"
                    rows="2"
                    value={formData.currentAddress || ""}
                    onChange={handleChange}
                    className="block w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanentAddress"
                    rows="2"
                    value={formData.permanentAddress || ""}
                    onChange={handleChange}
                    className="block w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <label className="block text-sm font-semibold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                  <ShieldPlus className="w-4 h-4" />
                  Emergency SOS Contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-rose-400" />
                  </div>
                  <input
                    type="text"
                    name="emergencyContact"
                    required
                    value={formData.emergencyContact || ""}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
                  This number receives the WhatsApp message and Phone Call when you press the SOS Button.
                </p>
              </div>
            </div>
          )}

          {activeTab === "org" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Organization Logo Uploader */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="relative group cursor-pointer" onClick={() => orgFileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {orgData.logo ? (
                      <img src={orgData.logo} alt="Organization Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={orgFileInputRef}
                    onChange={handleOrgFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left mt-2 sm:mt-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Organization Logo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Upload your organization's logo. Recommended size is 256x256px.
                  </p>
                </div>
              </div>

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
                      value={orgData.name}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Organization Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={orgData.email}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Organization Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={orgData.phone}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={orgData.city}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    State
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="state"
                      value={orgData.state}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="country"
                      value={orgData.country}
                      onChange={handleOrgChange}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  rows="3"
                  value={orgData.address}
                  onChange={handleOrgChange}
                  className="block w-full p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
            </div>
          )}

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div>
              {status === "success" && (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Saved successfully!
                </span>
              )}
              {status === "error" && (
                <span className="text-red-500 text-sm font-semibold">
                  Failed to save changes. Try again.
                </span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || isOrgLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-2xl font-black tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_5px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
            >
              {(isLoading || isOrgLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" strokeWidth={2.5} />
                  SAVE CHANGES
                </>
              )}
            </button>
          </div>
        </form>
        
        {activeTab === "profile" && <DeleteAccountSection type="user" />}
        {activeTab === "org" && <DeleteAccountSection type="org" />}
        </div>
      </div>
    </div>
  );
}
