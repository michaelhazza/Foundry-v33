import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/empty-state';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('sources');

  useEffect(() => { if (projectId) fetchAll(); }, [projectId]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [pRes, sRes, rRes, dRes] = await Promise.all([
        api.get("/projects/" + projectId),
        api.get("/projects/" + projectId + "/sources"),
        api.get("/projects/" + projectId + "/processing-runs"),
        api.get("/projects/" + projectId + "/datasets"),
      ]);
      setProject(pRes.data);
      setSources(Array.isArray(sRes.data) ? sRes.data : (sRes.data as any)?.sources || []);
      setRuns(Array.isArray(rRes.data) ? rRes.data : (rRes.data as any)?.runs || []);
      setDatasets(Array.isArray(dRes.data) ? dRes.data : (dRes.data as any)?.datasets || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleDelete() {
    try { await api.delete("/projects/" + projectId); navigate('/projects'); } catch (err) { console.error(err); }
  }

  if (loading) return <p className="text-gray-500">Loading project...</p>;
  if (!project) return <p className="text-red-600">Project not found</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/projects/' + projectId + '/sources/upload')}>Upload Source</Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
        </div>
      </div>
      <div className="flex gap-1 mb-6 border-b">
        {['sources', 'processing', 'datasets'].map((t) => (
          <button key={t} className={"px-4 py-2 text-sm font-medium border-b-2 transition-colors " + (activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700')} onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'sources' ? sources.length : t === 'processing' ? runs.length : datasets.length})</button>
        ))}
      </div>
      {activeTab === 'sources' && (sources.length === 0 ? <EmptyState title="No sources" description="Upload a data source." action={{ label: 'Upload Source', onClick: () => navigate('/projects/' + projectId + '/sources/upload') }} /> : (
        <Table><TableHeader><TableRow><TableHead>Filename</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
        <TableBody>{sources.map((s: any) => (<TableRow key={s.id} className="cursor-pointer" onClick={() => navigate('/projects/' + projectId + '/sources/' + s.id)}><TableCell>{s.filename}</TableCell><TableCell>{s.type}</TableCell><TableCell><StatusBadge status={s.status} /></TableCell><TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table>))}
      {activeTab === 'processing' && (runs.length === 0 ? <EmptyState title="No runs" description="Start a processing run." /> : (
        <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
        <TableBody>{runs.map((r: any) => (<TableRow key={r.id} className="cursor-pointer" onClick={() => navigate('/projects/' + projectId + '/processing/' + r.id)}><TableCell>#{r.id}</TableCell><TableCell><StatusBadge status={r.status} /></TableCell><TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table>))}
      {activeTab === 'datasets' && (datasets.length === 0 ? <EmptyState title="No datasets" description="Created from processing runs." /> : (
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Format</TableHead><TableHead>Rows</TableHead></TableRow></TableHeader>
        <TableBody>{datasets.map((d: any) => (<TableRow key={d.id} className="cursor-pointer" onClick={() => navigate('/projects/' + projectId + '/datasets/' + d.id)}><TableCell>{d.name}</TableCell><TableCell>{d.format}</TableCell><TableCell>{d.rowCount || '-'}</TableCell></TableRow>))}</TableBody></Table>))}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogHeader><DialogTitle>Delete Project</DialogTitle></DialogHeader>
        <p>Are you sure? This deletes all associated data.</p>
        <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
      </Dialog>
    </div>
  );
}
