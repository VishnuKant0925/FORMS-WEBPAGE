'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { profileService } from '@/services/profileService';
import { Loader2, Save, User, CheckCircle } from 'lucide-react';

const ProfileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  employeeCode: z.string().min(3, 'Employee code is required').max(30),
  department: z.string().min(2, 'Department is required').max(100),
  designation: z.string().min(2, 'Designation is required').max(100),
});

type ProfileFormInputs = z.infer<typeof ProfileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: '',
      employeeCode: '',
      department: '',
      designation: '',
    },
  });

  useEffect(() => {
    // Fetch latest profile data from API
    profileService.getProfile()
      .then((data) => {
        reset({
          name: data.name || '',
          employeeCode: data.employeeCode || '',
          department: data.department || '',
          designation: data.designation || '',
        });
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setErrorMsg('Failed to load profile data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: ProfileFormInputs) => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await profileService.updateProfile(data);
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err?.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-[#0B3C6D] animate-spin" />
        <span className="text-sm text-[#6B7280]">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <h1 className="text-xl font-bold text-[#1F2937] mb-6">My Profile</h1>

      {successMsg && (
        <div className="p-4 mb-6 text-sm text-[#2E7D32] bg-[#E8F5E9] border-l-4 border-[#2E7D32] rounded flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 mb-6 text-sm text-[#D32F2F] bg-[#FFEBEE] border-l-4 border-[#D32F2F] rounded">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-[#D9E2EC] rounded-lg shadow-sm overflow-hidden">
        {/* Profile Card Header */}
        <div className="bg-[#0B3C6D] p-6 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-white/80">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold uppercase bg-white/20 border border-white/20 rounded-full">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="form-field-row">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input id="name" type="text" {...register('name')} className="form-input" disabled={saving} required />
              {errors.name && <p className="text-xs text-[#D32F2F] mt-1">{errors.name.message}</p>}
            </div>

            {/* Employee Code */}
            <div className="form-field-row">
              <label htmlFor="employeeCode" className="form-label">Employee Code</label>
              <input id="employeeCode" type="text" {...register('employeeCode')} className="form-input" disabled={saving} required />
              {errors.employeeCode && <p className="text-xs text-[#D32F2F] mt-1">{errors.employeeCode.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department */}
            <div className="form-field-row">
              <label htmlFor="department" className="form-label">Division / Department</label>
              <input id="department" type="text" {...register('department')} className="form-input" disabled={saving} required />
              {errors.department && <p className="text-xs text-[#D32F2F] mt-1">{errors.department.message}</p>}
            </div>

            {/* Designation */}
            <div className="form-field-row">
              <label htmlFor="designation" className="form-label">Designation / Grade</label>
              <input id="designation" type="text" {...register('designation')} className="form-input" disabled={saving} required />
              {errors.designation && <p className="text-xs text-[#D32F2F] mt-1">{errors.designation.message}</p>}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-[#D9E2EC]">
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
