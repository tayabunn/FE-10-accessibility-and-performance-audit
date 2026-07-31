import { Metadata } from 'next';
import { UserProfileSettings } from '@/components/settings/user-profile-settings';

export const metadata: Metadata = {
  title: 'Settings — Astrine AI',
  description: 'Manage creator profile settings, payout details, and application preferences.',
};

export default function SettingsPage() {
  return (
    <main className="min-h-screen w-full bg-[#06050c] text-slate-100 font-sans py-8 px-4 relative overflow-x-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="relative z-10">
        <UserProfileSettings />
      </div>
    </main>
  );
}
