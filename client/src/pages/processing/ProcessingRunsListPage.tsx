import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';

export default function ProcessingRunsListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRuns(); }, [projectId, page]);

  async function fetchRuns() {
    setLoading(true);
    try {
      const res = await api.get('/projects/' + projectId + '/processing-runs?page=' + page + '&limit=20');
      const data = res.data as any;
      setRuns(Array.isArray(data) ? data : data?.runs || []);
      if (res.pagination) setTotalPages(res.pagination.totalPages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Processing Runs</h1>
        <Button onClick={() => navigate('/projects/' + projectId)}>Back to Project</Button>
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : runs.length === 0 ? (
        <EmptyState title="No processing runs" description="Processing runs are created from data sources." />
      ) : (
        <>
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead><TableHead>Source ID</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>{runs.map((r: any) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate('/projects/' + projectId + '/processing/' + r.id)}>
                <TableCell>#{r.id}</TableCell><TableCell><StatusBadge status={r.status} /></TableCell><TableCell>{r.sourceId}</TableCell><TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
