import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><Input value={user?.email || ''} disabled className="bg-gray-50" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><Input value={user?.role || ''} disabled className="bg-gray-50" /></div>
        </CardContent>
      </Card>
      <Card>
        <form onSubmit={handleChangePassword}>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert variant="success"><AlertDescription>{success}</AlertDescription></Alert>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
          </CardContent>
          <CardFooter className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Change Password'}</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}
