import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';

export default function IntegrationsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchIntegrations(); }, [user]);

  async function fetchIntegrations() {
    try {
      const res = await api.get('/organizations/' + user!.organizationId + '/integrations');
      const data = res.data as any;
      setIntegrations(Array.isArray(data) ? data : data?.integrations || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <Button onClick={() => navigate('/integrations/new')}>Add Integration</Button>
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : integrations.length === 0 ? (
        <EmptyState title="No integrations" description="Connect external services like Teamwork Desk." action={{ label: 'Add Integration', onClick: () => navigate('/integrations/new') }} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i: any) => (
            <Card key={i.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/integrations/' + i.id)}>
              <CardHeader><CardTitle className="text-lg">{i.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{i.type}</span>
                  <StatusBadge status={i.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
