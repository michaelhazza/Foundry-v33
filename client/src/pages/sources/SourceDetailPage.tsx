import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/status-badge';

interface Source {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SourceDetailPage() {
  const { projectId, sourceId } = useParams<{ projectId: string; sourceId: string }>();
  const navigate = useNavigate();

  const [source, setSource] = useState<Source | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSource();
  }, [projectId, sourceId]);

  async function fetchSource() {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get<Source>(`/projects/${projectId}/sources/${sourceId}`);
      setSource(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load source');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectId}/sources/${sourceId}`);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete source');
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
        <p className="text-gray-500">Loading source...</p>
      </div>
    );
  }

  if (error && !source) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!source) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={`/projects/${projectId}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Project
      </Link>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{source.fileName}</CardTitle>
            <StatusBadge status={source.status} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">File Size</dt>
              <dd className="text-sm text-gray-900 mt-1">{formatBytes(source.fileSize)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">MIME Type</dt>
              <dd className="text-sm text-gray-900 mt-1">{source.mimeType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
              <dd className="text-sm text-gray-900 mt-1">{new Date(source.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900 mt-1">{new Date(source.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="flex gap-3 mt-6">
            {source.downloadUrl && (
              <Button asChild>
                <a href={source.downloadUrl} download>
                  Download File
                </a>
              </Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              Delete Source
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle>Delete Source</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{source.fileName}</strong>? This action cannot be undone.
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
