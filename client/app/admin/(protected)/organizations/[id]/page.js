"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetOrganizationByIdQuery, useUpdateSuperAdminUserMutation, useDeleteSuperAdminUserMutation } from "@/services/api/superAdminApi";
import { Users, Mail, Phone, ChevronLeft, Building2, MapPin, X, Edit2, Check, Trash2 } from "lucide-react";
import { ROLE_LABELS } from "@/utils/roles";
import ExportButtons from "@/components/ui/ExportButtons";

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useGetOrganizationByIdQuery(id);
  const [updateUser] = useUpdateSuperAdminUserMutation();
  const [deleteUser] = useDeleteSuperAdminUserMutation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const handleDeleteUser = async (e, userId, userName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the user ${userName}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId).unwrap();
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Failed to delete user");
      }
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditForm(user);
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      await updateUser({ id: selectedUser.id, ...editForm }).unwrap();
      setIsEditing(false);
      setSelectedUser({ ...selectedUser, ...editForm });
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user");
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (isLoading) return <div className="p-8">Loading organization details...</div>;

  const org = data?.organization;

  if (!org) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organization not found</h2>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  const users = org.users || [];

  const userColumns = [
    { header: "User Name", key: "name" },
    { header: "Role", value: (row) => ROLE_LABELS[row.role] || row.role },
    { header: "Email", key: "email" },
    { header: "Phone", key: "phone" },
    { header: "Gender", key: "gender" },
    { header: "Blood Group", key: "blood_group" },
    { header: "Emergency Contact", key: "emergency_contact" },
    { header: "City", key: "city" },
    { header: "Current Address", key: "current_address" },
    { header: "Registered Date", value: (row) => new Date(row.created_at).toLocaleDateString() }
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super_admin":
        return "bg-black text-white dark:bg-white dark:text-black";
      case "admin":
      case "ORG_ADMIN":
      case "SUPER_ADMIN":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div>
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          Back to Organizations
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Building2 size={32} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{org.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1"><Mail size={14}/> {org.email}</span>
              <span className="flex items-center gap-1"><Phone size={14}/> {org.phone}</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> {org.city}, {org.state}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Organization Users ({users.length})</h2>
          <ExportButtons data={users} columns={userColumns} filename={`${org.name} - Users`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <th className="p-4">User Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No users found in this organization.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleSelectUser(user)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                          <Users size={20} />
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div>
                        {user.phone && <div className="flex items-center gap-2"><Phone size={14}/> {user.phone}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => handleDeleteUser(e, user.id, user.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Details</h2>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                )}
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                  {selectedUser.profile_photo ? (
                    <img src={selectedUser.profile_photo} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Users size={32} />
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input type="text" name="name" value={editForm.name || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 mb-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  )}
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(selectedUser.role)}`}>
                    {ROLE_LABELS[selectedUser.role] || selectedUser.role}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Email</div>
                  {isEditing ? (
                    <input type="email" name="email" value={editForm.email || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.email || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Phone</div>
                  {isEditing ? (
                    <input type="text" name="phone" value={editForm.phone || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.phone || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Emergency Contact</div>
                  {isEditing ? (
                    <input type="text" name="emergency_contact" value={editForm.emergency_contact || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.emergency_contact || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Blood Group</div>
                  {isEditing ? (
                    <select name="blood_group" value={editForm.blood_group || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.blood_group || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Gender</div>
                  {isEditing ? (
                    <select name="gender" value={editForm.gender || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.gender || '-'}</div>
                  )}
                </div>
                <div>
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">City</div>
                  {isEditing ? (
                    <input type="text" name="city" value={editForm.city || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.city || '-'}</div>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Current Address</div>
                  {isEditing ? (
                    <input type="text" name="current_address" value={editForm.current_address || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.current_address || '-'}</div>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Permanent Address</div>
                  {isEditing ? (
                    <input type="text" name="permanent_address" value={editForm.permanent_address || ''} onChange={handleInputChange} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                  ) : (
                    <div className="text-slate-900 dark:text-slate-200">{selectedUser.permanent_address || '-'}</div>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Registered Date</div>
                  <div className="text-slate-900 dark:text-slate-200">{new Date(selectedUser.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(selectedUser);
                    }}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Check size={16} /> Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
