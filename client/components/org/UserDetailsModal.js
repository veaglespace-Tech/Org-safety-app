import React from "react";
import { X, User, Phone, Mail, MapPin, Activity, Heart, ShieldAlert, Calendar, Edit, Trash2 } from "lucide-react";

export default function UserDetailsModal({ isOpen, onClose, user, onEdit, onDelete }) {
  if (!isOpen || !user) return null;

  const DetailItem = ({ icon: Icon, label, value, valueClass = "text-slate-900 dark:text-white" }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-blue-500 shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-medium truncate ${valueClass}`}>
          {value || <span className="text-slate-400 italic">Not provided</span>}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700 shadow-sm shrink-0">
              {user.profile_photo ? (
                <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-slate-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' 
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
                title="Edit User"
              >
                <Edit size={18} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(user); }}
                className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
                title="Delete User"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={16} className="text-blue-500" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <DetailItem icon={Mail} label="Email Address" value={user.email} />
            <DetailItem icon={Phone} label="Phone Number" value={user.phone} />
            <DetailItem icon={Activity} label="Gender" value={user.gender} />
            <DetailItem icon={Heart} label="Blood Group" value={user.blood_group} valueClass="text-red-500 font-bold" />
            <DetailItem icon={Calendar} label="Joined Date" value={new Date(user.created_at).toLocaleDateString()} />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" /> Location & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <DetailItem icon={MapPin} label="City" value={user.city} />
            <DetailItem icon={ShieldAlert} label="Emergency Contact" value={user.emergency_contact} valueClass="text-rose-500 font-bold" />
            <div className="sm:col-span-2">
              <DetailItem icon={MapPin} label="Current Address" value={user.current_address} />
            </div>
            <div className="sm:col-span-2">
              <DetailItem icon={MapPin} label="Permanent Address" value={user.permanent_address} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
