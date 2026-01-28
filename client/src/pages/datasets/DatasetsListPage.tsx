import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/empty-state';

export default function DatasetsListPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDatasets(); }, [projectId, page]);

  async function fetchDatasets() {
    setLoading(true);
    try {
      const url = projectId ? '/projects/' + projectId + '/datasets?page=' + page : '/projects/0/datasets?page=' + page;
      const res = await api.get(url);
      const data = res.data as any;
      setDatasets(Array.isArray(data) ? data : data?.datasets || []);
      if (res.pagination) setTotalPages(res.pagination.totalPages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Datasets</h1>
      </div>
      {loading ? <p className="text-gray-500">Loading...</p> : datasets.length === 0 ? (
        <EmptyState title="No datasets" description="Datasets are generated from processing runs." />
      ) : (
        <>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Format</TableHead><TableHead>Rows</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{datasets.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium cursor-pointer hover:text-blue-600" onClick={() => navigate((projectId ? '/projects/' + projectId : '') + '/datasets/' + d.id)}>{d.name}</TableCell>
                <TableCell>{d.format}</TableCell><TableCell>{d.rowCount?.toLocaleString() || '-'}</TableCell><TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                <TableCell><Button variant="outline" size="sm" onClick={() => window.open('/api/projects/' + (projectId || d.projectId) + '/datasets/' + d.id + '/download')}>Download</Button></TableCell>
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
