"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import AvatarUploader from "@/components/user/AvatarUploader";

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  // --- Profile info section ---
  const [profileData, setProfileData] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Password section ---
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setIsSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("phone", profileData.phone);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updateProfile(formData);
      showToast("Profile updated!");
      setAvatarFile(null);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setIsSavingPassword(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      showToast("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not change password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="app-shell max-w-2xl space-y-6">
        <div>
          <span className="eyebrow">Account</span>
          <h1 className="mt-4 section-title">My Profile</h1>
        </div>

        <form onSubmit={handleProfileSubmit} className="surface-card space-y-4 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Profile Details</h2>

          <AvatarUploader currentAvatar={user?.avatar} onChange={setAvatarFile} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
            <input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="input-shell"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input value={user?.email || ""} disabled className="input-shell cursor-not-allowed bg-slate-100 text-slate-400" />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
            <input
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="input-shell"
            />
          </div>

          {profileError && <p className="text-sm font-medium text-red-600">{profileError}</p>}

          <button type="submit" disabled={isSavingProfile} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="surface-card space-y-4 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Change Password</h2>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input-shell"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-shell"
            />
          </div>

          {passwordError && <p className="text-sm font-medium text-red-600">{passwordError}</p>}

          <button type="submit" disabled={isSavingPassword} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {isSavingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>

        <Link href="/user/addresses" className="surface-card block p-4 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:text-orange-600">
          Manage Saved Addresses →
        </Link>
      </div>
    </ProtectedRoute>
  );
}