import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { if (user) fetchOrg(); }, [user]);

  async function fetchOrg() {
    try {
      const res = await api.get('/organizations/' + user!.organizationId);
      const org = res.data as any;
      setOrgName(org.name || '');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/organizations/' + user!.organizationId, { name: orgName });
      setSuccess('Organization updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader><CardTitle>Organization Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert variant="success"><AlertDescription>{success}</AlertDescription></Alert>}
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label><Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required /></div>
            {user?.role !== 'owner' && <p className="text-sm text-amber-600">Only organization owners can modify settings.</p>}
          </CardContent>
          <CardFooter className="flex justify-end"><Button type="submit" disabled={saving || user?.role !== 'owner'}>{saving ? 'Saving...' : 'Save Changes'}</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}
