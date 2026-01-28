import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Dataset {
  id: number;
  name: string;
  description?: string;
  format: string;
  rowCount: number;
  fileSize?: number;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DatasetDetailPage() {
  const { projectId, datasetId } = useParams<{ projectId?: string; datasetId: string }>();
  const navigate = useNavigate();

  const isProjectScoped = Boolean(projectId);

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDataset();
  }, [projectId, datasetId]);

  async function fetchDataset() {
    setIsLoading(true);
    setError('');
    try {
      const basePath = isProjectScoped
        ? `/projects/${projectId}/datasets/${datasetId}`
        : `/datasets/${datasetId}`;
      const response = await api.get<Dataset>(basePath);
      setDataset(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dataset');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const basePath = isProjectScoped
        ? `/projects/${projectId}/datasets/${datasetId}`
        : `/datasets/${datasetId}`;
      await api.delete(basePath);
      if (isProjectScoped) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate('/datasets');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete dataset');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading dataset...</p>
      </div>
    );
  }

  if (error && !dataset) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dataset) return null;

  const backPath = isProjectScoped ? `/projects/${projectId}` : '/datasets';
  const backLabel = isProjectScoped ? 'Back to Project' : 'Back to Datasets';

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={backPath} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; {backLabel}
      </Link>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{dataset.name}</CardTitle>
            <Badge variant="secondary">{dataset.format}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {dataset.description && (
            <p className="text-gray-600 mb-4">{dataset.description}</p>
          )}

          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Row Count</dt>
              <dd className="text-sm text-gray-900 mt-1">{dataset.rowCount?.toLocaleString() ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Format</dt>
              <dd className="text-sm text-gray-900 mt-1">{dataset.format}</dd>
            </div>
            {dataset.fileSize !== undefined && (
              <div>
                <dt className="text-sm font-medium text-gray-500">File Size</dt>
                <dd className="text-sm text-gray-900 mt-1">{formatBytes(dataset.fileSize)}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900 mt-1">{new Date(dataset.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900 mt-1">{new Date(dataset.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="flex gap-3 mt-6">
            {dataset.downloadUrl && (
              <Button asChild>
                <a href={dataset.downloadUrl} download>
                  Download Dataset
                </a>
              </Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              Delete Dataset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle>Delete Dataset</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{dataset.name}</strong>? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
