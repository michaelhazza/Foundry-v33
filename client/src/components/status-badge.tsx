import { Badge } from './ui/badge';

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  running: { variant: 'default', label: 'Running' },
  processing: { variant: 'default', label: 'Processing' },
  completed: { variant: 'success', label: 'Completed' },
  ready: { variant: 'success', label: 'Ready' },
  failed: { variant: 'destructive', label: 'Failed' },
  error: { variant: 'destructive', label: 'Error' },
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'secondary', label: 'Inactive' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
