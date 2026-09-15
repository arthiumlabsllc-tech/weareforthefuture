"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/supporter/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.supporter);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/supporter/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          country: profile.country,
          city: profile.city,
          emailNotifications: profile.emailNotifications,
          marketingEmails: profile.marketingEmails,
        }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMessage("Passwords do not match");
      return;
    }
    setPwSaving(true);
    setPwMessage("");

    try {
      const res = await fetch("/api/supporter/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPwMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwMessage(""), 3000);
      } else {
        setPwMessage(data.error || "Failed to change password");
      }
    } catch {
      setPwMessage("Failed to change password");
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <p className="text-text-muted">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-bg-primary lg:pl-64">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your account preferences.
          </p>
        </motion.div>

        {/* Profile Section */}
        <form
          onSubmit={handleProfileSave}
          className="mb-8 rounded-2xl bg-surface border border-border p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Profile Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full rounded-xl border border-border bg-bg-primary/50 px-4 py-2.5 text-sm text-text-muted cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-text-muted">
                Email cannot be changed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  placeholder="+233 XX XXX XXXX"
                  className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Country
                </label>
                <input
                  type="text"
                  value={profile.country || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, country: e.target.value })
                  }
                  placeholder="Ghana"
                  className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                value={profile.city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, city: e.target.value })
                }
                placeholder="Accra"
                className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={profile.emailNotifications}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border-strong text-primary focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">
                  Email notifications for donations and updates
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={profile.marketingEmails}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      marketingEmails: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-border-strong text-primary focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">
                  Marketing emails and newsletters
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
            {message && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-3 w-3" />
                {message}
              </span>
            )}
          </div>
        </form>

        {/* Password Section */}
        <form
          onSubmit={handlePasswordSave}
          className="rounded-2xl bg-surface border border-border p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Change Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-border-strong bg-bg-primary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={pwSaving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-primary transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {pwSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Change Password"
              )}
            </button>
            {pwMessage && (
              <span
                className={`text-sm ${
                  pwMessage.includes("success")
                    ? "text-green-600"
                    : "text-error"
                }`}
              >
                {pwMessage}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
