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
      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-bold">My Profile</h1>

        <form onSubmit={handleProfileSubmit} className="bg-white border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-sm text-gray-500">Profile Details</h2>

          <AvatarUploader currentAvatar={user?.avatar} onChange={setAvatarFile} />

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={user?.email || ""} disabled className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-400" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {profileError && <p className="text-sm text-red-600">{profileError}</p>}

          <button type="submit" disabled={isSavingProfile} className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50">
            {isSavingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="bg-white border rounded-lg p-4 space-y-4">
          <h2 className="font-semibold text-sm text-gray-500">Change Password</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

          <button type="submit" disabled={isSavingPassword} className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50">
            {isSavingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>

        <Link
          href="/user/addresses"
          className="block bg-white border rounded-lg p-4 text-sm hover:border-orange-400"
        >
          <span className="font-medium">Manage Saved Addresses →</span>
        </Link>
      </div>
    </ProtectedRoute>
  );
}