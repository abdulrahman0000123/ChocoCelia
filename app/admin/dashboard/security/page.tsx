'use client';

import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    if (newPassword !== confirmation) {
      setMessage('New passwords do not match.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setMessage('Password updated successfully.');
      window.setTimeout(() => router.replace('/admin/login'), 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update password.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 text-white">
      <header className="flex items-center gap-3">
        <KeyRound className="h-7 w-7 text-gold-400" />
        <div>
          <h1 className="text-2xl font-bold">Account security</h1>
          <p className="text-sm text-chocolate-200">Update the password for your administrator account.</p>
        </div>
      </header>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-chocolate-800 bg-chocolate-950/60 p-5 sm:p-7">
        <label className="block space-y-2 text-sm font-semibold">
          <span>Current password</span>
          <input autoComplete="current-password" type="password" required maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-chocolate-700 bg-chocolate-900 px-4 text-base text-white outline-none focus:border-gold-500" />
        </label>
        <label className="block space-y-2 text-sm font-semibold">
          <span>New password</span>
          <input autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-chocolate-700 bg-chocolate-900 px-4 text-base text-white outline-none focus:border-gold-500" />
          <span className="block text-xs font-normal text-chocolate-300">At least 12 characters, with uppercase and lowercase letters and a number.</span>
        </label>
        <label className="block space-y-2 text-sm font-semibold">
          <span>Confirm new password</span>
          <input autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="min-h-12 w-full rounded-xl border border-chocolate-700 bg-chocolate-900 px-4 text-base text-white outline-none focus:border-gold-500" />
        </label>
        {message && <p role="status" className="text-sm text-gold-300">{message}</p>}
        <button disabled={isSaving} className="min-h-12 w-full rounded-xl bg-gold-500 px-5 font-bold text-chocolate-950 transition hover:bg-gold-400 disabled:cursor-wait disabled:opacity-60">
          {isSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
