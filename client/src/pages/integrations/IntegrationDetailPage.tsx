import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/status-badge';

export default function IntegrationDetailPage() {
  const { integrationId } = useParams<{ integrationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNew = integrationId === 'new';
  const [name, setName] = useState('');
  const [type, setType] = useState('teamwork_desk');
  const [apiKey, setApiKey] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [integration, setIntegration] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const orgId = user?.organizationId;

  useEffect(() => { if (!isNew && orgId) fetchIntegration(); }, [integrationId, orgId]);

  async function fetchIntegration() {
    try {
      const res = await api.get('/organizations/' + orgId + '/integrations/' + integrationId);
      const data = res.data as any;
      setIntegration(data);
      setName(data.name || '');
      setType(data.type || 'teamwork_desk');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const body: any = { name, type, credentials: { apiKey, subdomain } };
      if (isNew) {
        await api.post('/organizations/' + orgId + '/integrations', body);
      } else {
        await api.patch('/organizations/' + orgId + '/integrations/' + integrationId, body);
      }
      navigate('/integrations');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setSuccess('');
    setError('');
    try {
      const res = await api.get('/organizations/' + orgId + '/integrations/' + integrationId + '/test');
      setSuccess('Connection successful!');
    } catch (err: any) {
      setError('Connection failed: ' + (err.message || 'Unknown error'));
    }
  }

  async function handleDelete() {
    try { await api.delete('/organizations/' + orgId + '/integrations/' + integrationId); navigate('/integrations'); } catch (err: any) { setError(err.message); }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Add Integration' : 'Edit Integration'}</CardTitle>
          {integration && <StatusBadge status={integration.status} />}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert variant="success"><AlertDescription>{success}</AlertDescription></Alert>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Integration" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="teamwork_desk">Teamwork Desk</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">API Key</label><Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label><Input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="yourcompany" /></div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            {!isNew && <Button variant="destructive" onClick={handleDelete}>Delete</Button>}
            {!isNew && <Button variant="outline" onClick={handleTest}>Test Connection</Button>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/integrations')}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
