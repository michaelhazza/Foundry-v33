import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';

export default function ProcessingRunDetailPage() {
  const { projectId, runId } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRun(); }, [projectId, runId]);

  async function fetchRun() {
    try {
      const [runRes, logsRes] = await Promise.all([
        api.get('/projects/' + projectId + '/processing-runs/' + runId),
        api.get('/projects/' + projectId + '/processing-runs/' + runId + '/logs'),
      ]);
      setRun(runRes.data);
      const logsData = logsRes.data as any;
      setLogs(logsData?.logs || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleDelete() {
    try { await api.delete('/projects/' + projectId + '/processing-runs/' + runId); navigate('/projects/' + projectId + '/processing'); } catch (err) { console.error(err); }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!run) return <p className="text-red-600">Processing run not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Processing Run #{run.id}</CardTitle>
          <div className="flex gap-2">
            <StatusBadge status={run.status} />
            <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-sm text-gray-500">Status</dt><dd><StatusBadge status={run.status} /></dd></div>
            <div><dt className="text-sm text-gray-500">Source ID</dt><dd>{run.sourceId}</dd></div>
            <div><dt className="text-sm text-gray-500">Created</dt><dd>{new Date(run.createdAt).toLocaleString()}</dd></div>
            <div><dt className="text-sm text-gray-500">Updated</dt><dd>{new Date(run.updatedAt).toLocaleString()}</dd></div>
            {run.error && <div className="col-span-2"><dt className="text-sm text-gray-500">Error</dt><dd className="text-red-600">{run.error}</dd></div>}
            {run.config && <div className="col-span-2"><dt className="text-sm text-gray-500">Config</dt><dd><pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(run.config, null, 2)}</pre></dd></div>}
            {run.stats && <div className="col-span-2"><dt className="text-sm text-gray-500">Stats</dt><dd><pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(run.stats, null, 2)}</pre></dd></div>}
          </dl>
        </CardContent>
      </Card>
      {logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Logs</CardTitle></CardHeader>
          <CardContent><pre className="text-xs bg-gray-900 text-green-400 p-4 rounded max-h-96 overflow-auto">{logs.map((l: any, i: number) => l.message || JSON.stringify(l)).join('\n')}</pre></CardContent>
        </Card>
      )}
    </div>
  );
}
