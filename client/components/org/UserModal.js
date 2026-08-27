import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, RefreshCw } from "lucide-react";
import { useCreateOrgUserMutation, usePatchOrgUserMutation } from "@/services/api/orgApi";

const userSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  role: z.enum(["admin", "member"]).default("member"),
  city: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  blood_group: z.string().optional().nullable(),
  current_address: z.string().optional().nullable(),
  permanent_address: z.string().optional().nullable(),
});

export default function UserModal({ isOpen, onClose, user = null }) {
  const isEditing = !!user?.id;
  
  const [createUser, { isLoading: isCreating }] = useCreateOrgUserMutation();
  const [updateUser, { isLoading: isUpdating }] = usePatchOrgUserMutation();
  
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      emergency_contact: "",
      role: "member",
      city: "",
      gender: "",
      blood_group: "",
      current_address: "",
      permanent_address: "",
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          emergency_contact: user.emergency_contact || "",
          role: user.role === "admin" || user.role === "ORG_ADMIN" || user.role === "SUPER_ADMIN" ? "admin" : "member",
          city: user.city || "",
          gender: user.gender || "",
          blood_group: user.blood_group || "",
          current_address: user.current_address || "",
          permanent_address: user.permanent_address || "",
        });
      } else {
        reset({
          name: "",
          email: "",
          phone: "",
          emergency_contact: "",
          role: "member",
          city: "",
          gender: "",
          blood_group: "",
          current_address: "",
          permanent_address: "",
        });
      }
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  console.log("Form State:", watch(), errors);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateUser({ userId: user.id, ...data }).unwrap();
      } else {
        await createUser(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(error?.data?.error || "An error occurred");
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
  const labelClass = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" {...register("name")} className={inputClass} placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email Address</label>
            <input id="email" type="email" {...register("email")} className={inputClass} placeholder="john@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="text" {...register("phone")} className={inputClass} placeholder="+1234567890" />
            </div>
            <div>
              <label className={labelClass}>Emergency Contact</label>
              <input type="text" {...register("emergency_contact")} className={inputClass} placeholder="+1234567890" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input type="text" {...register("city")} className={inputClass} placeholder="City" />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select {...register("gender")} className={inputClass}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select {...register("blood_group")} className={inputClass}>
                <option value="">Select</option>
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

          <div>
            <label className={labelClass}>Current Address</label>
            <input type="text" {...register("current_address")} className={inputClass} placeholder="Current Address" />
          </div>

          <div>
            <label className={labelClass}>Permanent Address</label>
            <input type="text" {...register("permanent_address")} className={inputClass} placeholder="Permanent Address" />
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select {...register("role")} className={inputClass}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {!isEditing && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium">
              Note: The default password for this user will be <strong>Password@123</strong>. They should change it after logging in.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading && <RefreshCw size={16} className="animate-spin" />}
              {isEditing ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
