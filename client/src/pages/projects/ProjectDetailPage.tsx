import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';

interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Source {
  id: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  createdAt: string;
}

interface ProcessingRun {
  id: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface Dataset {
  id: number;
  name: string;
  format: string;
  rowCount: number;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [runs, setRuns] = useState<ProcessingRun[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'processing' | 'datasets'>('sources');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [projectId]);

  async function fetchAll() {
    setIsLoading(true);
    setError('');
    try {
      const [projRes, srcRes, runRes, dsRes] = await Promise.all([
        api.get<Project>(`/projects/${projectId}`),
        api.get<Source[]>(`/projects/${projectId}/sources`),
        api.get<ProcessingRun[]>(`/projects/${projectId}/processing-runs`),
        api.get<Dataset[]>(`/projects/${projectId}/datasets`),
      ]);
      setProject(projRes.data);
      setEditName(projRes.data.name);
      setSources(srcRes.data);
      setRuns(runRes.data);
      setDatasets(dsRes.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveName() {
    if (!editName.trim() || !project) return;
    setSaving(true);
    try {
      const res = await api.patch<Project>(`/projects/${projectId}`, { name: editName.trim() });
      setProject(res.data);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update project');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectId}`);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete project');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading project...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project) return null;

  const tabs = [
    { key: 'sources' as const, label: 'Sources', count: sources.length },
    { key: 'processing' as const, label: 'Processing Runs', count: runs.length },
    { key: 'datasets' as const, label: 'Datasets', count: datasets.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link to="/projects" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Projects
        </Link>

        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-bold w-80"
              />
              <Button onClick={handleSaveName} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditName(project.name); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </div>
          )}
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            Delete Project
          </Button>
        </div>

        {project.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${projectId}/sources/upload`)}
        >
          Upload Source
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${projectId}/processing`)}
        >
          Processing Runs
        </Button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'sources' && (
        sources.length === 0 ? (
          <EmptyState
            title="No sources yet"
            description="Upload source files to get started."
            action={{ label: 'Upload Source', onClick: () => navigate(`/projects/${projectId}/sources/upload`) }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/sources/${source.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {source.fileName}
                    </Link>
                  </TableCell>
                  <TableCell>{formatBytes(source.fileSize)}</TableCell>
                  <TableCell>{source.mimeType}</TableCell>
                  <TableCell><StatusBadge status={source.status} /></TableCell>
                  <TableCell>{new Date(source.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      {activeTab === 'processing' && (
        runs.length === 0 ? (
          <EmptyState
            title="No processing runs"
            description="Start a processing run to transform your sources into datasets."
            action={{ label: 'View Processing', onClick: () => navigate(`/projects/${projectId}/processing`) }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/processing/${run.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      #{run.id}
                    </Link>
                  </TableCell>
                  <TableCell><StatusBadge status={run.status} /></TableCell>
                  <TableCell>{new Date(run.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{run.completedAt ? new Date(run.completedAt).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      {activeTab === 'datasets' && (
        datasets.length === 0 ? (
          <EmptyState
            title="No datasets yet"
            description="Datasets are generated from processing runs."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell>
                    <Link
                      to={`/projects/${projectId}/datasets/${ds.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {ds.name}
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{ds.format}</Badge></TableCell>
                  <TableCell>{ds.rowCount?.toLocaleString() ?? '-'}</TableCell>
                  <TableCell>{new Date(ds.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">
          Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
          All sources, processing runs, and datasets in this project will be permanently deleted.
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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
