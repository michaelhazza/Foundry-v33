import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SourceUploadPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  }

  async function handleUpload() {
    if (!file || !projectId) return;
    setUploading(true);
    setError('');
    try {
      await api.upload('/projects/' + projectId + '/sources', file);
      navigate('/projects/' + projectId);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Upload Data Source</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div
            className={"border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors " + (dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400")}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" className="hidden" accept=".csv,.xlsx,.xls,.png,.jpg,.jpeg" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            {file ? (
              <div><p className="font-medium text-gray-900">{file.name}</p><p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            ) : (
              <div><p className="text-gray-600 font-medium">Drop file here or click to browse</p><p className="text-sm text-gray-400 mt-1">CSV, Excel, or images up to 100MB</p></div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/projects/' + projectId)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
