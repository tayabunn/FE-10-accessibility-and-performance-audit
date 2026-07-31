'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { creatorSettingsSchema, CreatorSettings } from '@/lib/schema';
import {
  User,
  Mail,
  CreditCard,
  FileText,
  Palette,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface FormErrors {
  username?: string;
  email?: string;
  payoutEmail?: string;
  bio?: string;
  theme?: string;
  newsletter?: string;
}

const DEFAULT_FIELDS: CreatorSettings = {
  username: 'tayabunn',
  email: 'tayabunnesa@gmail.com',
  payoutEmail: 'tayabunnesa+payout@gmail.com',
  bio: 'AI workflows developer & generative UI engineer.',
  theme: 'dark',
  newsletter: true,
};

export function UserProfileSettings() {
  const [fields, setFields] = useState<CreatorSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('creator-profile-settings');
        if (saved) {
          return { ...DEFAULT_FIELDS, ...JSON.parse(saved) };
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_FIELDS;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<boolean>(false);

  const validateSingleField = (name: keyof CreatorSettings, value: unknown): string | undefined => {
    const singleFieldSchema = creatorSettingsSchema.pick({ [name]: true } as Record<keyof CreatorSettings, true>);
    const result = singleFieldSchema.safeParse({ [name]: value });
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return undefined;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFields((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (touched[name]) {
      const error = validateSingleField(name as keyof CreatorSettings, fieldValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const fieldValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateSingleField(name as keyof CreatorSettings, fieldValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      payoutEmail: true,
      bio: true,
      theme: true,
      newsletter: true,
    });

    const result = creatorSettingsSchema.safeParse(fields);

    if (!result.success) {
      const formattedErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof FormErrors;
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setSuccess(false);

      // Auto-focus first erroneous input for accessibility
      const errorKeys = Object.keys(formattedErrors) as (keyof FormErrors)[];
      if (errorKeys.length > 0) {
        const firstErrorField = errorKeys[0];
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }

    // Success path
    setErrors({});
    try {
      localStorage.setItem('creator-profile-settings', JSON.stringify(fields));
    } catch {
      // Ignored
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const bioLength = fields.bio?.length || 0;
  const isBioWarning = bioLength > 120;
  const isBioLimitExceeded = bioLength > 150;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Back button header */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-900/30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 hover:text-white transition-all text-xs border border-purple-800/40 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Chat</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-[11px] font-mono text-purple-300">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>FE-03 Creator Drill</span>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="relative rounded-2xl bg-[#0b081e]/90 border border-purple-800/50 p-6 md:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Card Header */}
        <div className="relative z-10 space-y-1 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <User className="w-6 h-6" />
            </span>
            Profile Settings
          </h1>
          <p className="text-sm text-purple-200/70 pl-14">
            Manage your creator profile, payout account, theme preferences, and notifications.
          </p>
        </div>

        {/* Toast / Success Banner */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center gap-3 shadow-lg shadow-emerald-950/40"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Settings saved successfully!</p>
                <p className="text-xs text-emerald-300/80">Your profile preferences have been updated in local storage.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Username <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-sm">@</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={fields.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'username-error' : 'username-hint'}
                  placeholder="tayabunn"
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-purple-950/30 border transition-all text-slate-100 placeholder:text-slate-600 focus:outline-none ${
                    errors.username
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/20'
                      : 'border-purple-800/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }`}
                  required
                />
              </div>
              {errors.username ? (
                <p id="username-error" className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 font-medium" role="alert">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.username}</span>
                </p>
              ) : (
                <p id="username-hint" className="text-[11px] text-purple-300/60">
                  3-20 characters, lowercase letters, numbers, and underscores only.
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Email Address <span className="text-purple-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={fields.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  placeholder="creator@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-purple-950/30 border transition-all text-slate-100 placeholder:text-slate-600 focus:outline-none ${
                    errors.email
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/20'
                      : 'border-purple-800/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 font-medium" role="alert">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Payout Email */}
          <div className="space-y-2">
            <label htmlFor="payoutEmail" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Payout Email (Supports +alias) <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="email"
                id="payoutEmail"
                name="payoutEmail"
                value={fields.payoutEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={errors.payoutEmail ? 'true' : 'false'}
                aria-describedby={errors.payoutEmail ? 'payoutEmail-error' : 'payoutEmail-hint'}
                placeholder="creator+payout@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-purple-950/30 border transition-all text-slate-100 placeholder:text-slate-600 focus:outline-none ${
                  errors.payoutEmail
                    ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/20'
                    : 'border-purple-800/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                }`}
                required
              />
            </div>
            {errors.payoutEmail ? (
              <p id="payoutEmail-error" className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 font-medium" role="alert">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.payoutEmail}</span>
              </p>
            ) : (
              <p id="payoutEmail-hint" className="text-[11px] text-purple-300/60">
                Email used for payouts. Supports alias tags like <code className="bg-purple-950 px-1 py-0.5 rounded text-purple-300">user+payout@gmail.com</code>.
              </p>
            )}
          </div>

          {/* Bio Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Bio Description
              </label>
              <span
                className={`text-xs font-mono transition-colors ${
                  isBioLimitExceeded
                    ? 'text-rose-400 font-bold'
                    : isBioWarning
                    ? 'text-amber-400 font-semibold'
                    : 'text-purple-300/60'
                }`}
                aria-live="polite"
              >
                {bioLength} / 150
              </span>
            </div>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <textarea
                id="bio"
                name="bio"
                value={fields.bio || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={errors.bio ? 'true' : 'false'}
                aria-describedby={errors.bio ? 'bio-error' : 'bio-hint'}
                placeholder="Tell us a little bit about yourself and your content..."
                rows={3}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-purple-950/30 border transition-all text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none ${
                  errors.bio
                    ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/20'
                    : 'border-purple-800/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                }`}
              />
            </div>
            {errors.bio ? (
              <p id="bio-error" className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 font-medium" role="alert">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.bio}</span>
              </p>
            ) : (
              <p id="bio-hint" className="text-[11px] text-purple-300/60">
                Brief creator intro displayed on public channel profiles.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Theme Select */}
            <div className="space-y-2">
              <label htmlFor="theme" className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Interface Theme
              </label>
              <div className="relative">
                <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <select
                  id="theme"
                  name="theme"
                  value={fields.theme}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-purple-950/40 border border-purple-800/50 text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="dark" className="bg-[#0b081e] text-slate-100">
                    Dark Mode (Glassmorphic)
                  </option>
                  <option value="light" className="bg-[#0b081e] text-slate-100">
                    Light Mode
                  </option>
                </select>
              </div>
            </div>

            {/* Newsletter Switch */}
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 cursor-pointer hover:bg-purple-950/50 transition-all">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  checked={fields.newsletter}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-purple-700 bg-purple-950 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-slate-200">Subscribe to platform updates & notifications</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
