'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  Upload,
  Check,
  Camera,
  Save,
  KeyRound,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { PageContainer } from '@/components/ui/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { snackbar } from '@/utils/snackbar';

export default function ProfileSettingsPage() {
  const { user, setAuth, token } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || user?.logo || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: 'employee_avatars' });
      setAvatarUrl(res.secure_url);
      snackbar.success('Profile avatar uploaded to Cloudinary');
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
      snackbar.info('Avatar selected (preview mode)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedUser = {
        ...user,
        name: name.trim(),
        avatarUrl,
        logo: avatarUrl,
      };

      if (token) {
        setAuth(updatedUser, token);
      }

      snackbar.success('Employee profile updated successfully!');
    } catch (err: any) {
      snackbar.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer
      title="My Profile Settings"
      subtitle="View and manage your personal employee credentials, display photo, and account preferences"
      badge="Personal Settings"
    >
      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-6 border-b border-border/60 pb-6">
            <div className="relative group cursor-pointer">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center font-bold text-accent text-2xl overflow-hidden shrink-0 shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  name.substring(0, 2).toUpperCase() || 'ME'
                )}
              </div>
              <label
                htmlFor="employee-avatar-input"
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl cursor-pointer text-white"
                title="Change Avatar"
              >
                <Camera className="h-6 w-6" />
              </label>
              <input
                id="employee-avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-xs text-accent font-semibold">{user?.designation || 'Software Engineer'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Full Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 text-xs bg-muted/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Employee Login ID</Label>
                <Input
                  type="text"
                  value={user?.employeeId || 'EMP1001'}
                  disabled
                  className="h-10 text-xs font-mono font-bold bg-muted/40 text-accent cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Corporate Email</Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="h-10 text-xs bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Department</Label>
                <Input
                  type="text"
                  value={user?.department || 'Software Engineering'}
                  disabled
                  className="h-10 text-xs bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="h-10 px-6 bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
