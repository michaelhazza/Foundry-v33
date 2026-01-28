import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function DatasetDetailPage() {
  const { projectId, datasetId } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => { fetchDataset(); }, [projectId, datasetId]);

  async function fetchDataset() {
    try {
      const pid = projectId || '0';
      const res = await api.get('/projects/' + pid + '/datasets/' + datasetId);
      setDataset(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleDelete() {
    try {
      const pid = projectId || dataset?.projectId || '0';
      await api.delete('/projects/' + pid + '/datasets/' + datasetId);
      navigate(projectId ? '/projects/' + projectId + '/datasets' : '/datasets');
    } catch (err) { console.error(err); }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!dataset) return <p className="text-red-600">Dataset not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{dataset.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('/api/projects/' + (projectId || dataset.projectId) + '/datasets/' + datasetId + '/download')}>Download</Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div><dt className="text-sm text-gray-500">Format</dt><dd><Badge>{dataset.format}</Badge></dd></div>
            <div><dt className="text-sm text-gray-500">Row Count</dt><dd>{dataset.rowCount?.toLocaleString() || '-'}</dd></div>
            <div><dt className="text-sm text-gray-500">Created</dt><dd>{new Date(dataset.createdAt).toLocaleString()}</dd></div>
            <div><dt className="text-sm text-gray-500">Updated</dt><dd>{new Date(dataset.updatedAt).toLocaleString()}</dd></div>
            {dataset.metadata && <div className="col-span-2"><dt className="text-sm text-gray-500">Metadata</dt><dd><pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(dataset.metadata, null, 2)}</pre></dd></div>}
          </dl>
        </CardContent>
      </Card>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogHeader><DialogTitle>Delete Dataset</DialogTitle></DialogHeader>
        <p className="text-gray-600">Are you sure you want to delete this dataset?</p>
        <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
      </Dialog>
    </div>
  );
}
