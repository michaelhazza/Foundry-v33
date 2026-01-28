import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function SourceDetailPage() {
  const { projectId, sourceId } = useParams();
  const navigate = useNavigate();
  const [source, setSource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => { fetchSource(); }, [projectId, sourceId]);

  async function fetchSource() {
    try {
      const res = await api.get('/projects/' + projectId + '/sources/' + sourceId);
      setSource(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleDelete() {
    try { await api.delete('/projects/' + projectId + '/sources/' + sourceId); navigate('/projects/' + projectId); } catch (err) { console.error(err); }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!source) return <p className="text-red-600">Source not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{source.filename}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('/api/projects/' + projectId + '/sources/' + sourceId + '/download')}>Download</Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-sm text-gray-500">Type</dt><dd className="font-medium">{source.type}</dd></div>
            <div><dt className="text-sm text-gray-500">Status</dt><dd><StatusBadge status={source.status} /></dd></div>
            <div><dt className="text-sm text-gray-500">Size</dt><dd>{source.size ? (source.size / 1024).toFixed(1) + ' KB' : '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">MIME Type</dt><dd>{source.mimetype || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Created</dt><dd>{new Date(source.createdAt).toLocaleString()}</dd></div>
            <div><dt className="text-sm text-gray-500">Updated</dt><dd>{new Date(source.updatedAt).toLocaleString()}</dd></div>
          </dl>
        </CardContent>
      </Card>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogHeader><DialogTitle>Delete Source</DialogTitle></DialogHeader>
        <p className="text-gray-600">Delete this source and all associated processing runs?</p>
        <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
      </Dialog>
    </div>
  );
}
