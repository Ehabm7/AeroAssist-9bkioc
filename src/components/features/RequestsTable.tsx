import { Trash2, Clock, Plane, User } from 'lucide-react';
import { ServiceRequest, CASE_TYPES } from '@/types';
import { deleteRequest } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  requests: ServiceRequest[];
  canDelete?: boolean;
  onRefresh: () => void;
  emptyLabel?: string;
}

export default function RequestsTable({ requests, canDelete, onRefresh, emptyLabel }: Props) {
  function handleDelete(id: string) {
    if (!confirm('Delete this request?')) return;
    deleteRequest(id);
    toast.success('Request deleted.');
    onRefresh();
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">{emptyLabel ?? 'No requests found.'}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Flight</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Case</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
            {canDelete && <th className="py-3 px-3"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {requests.map(req => {
            const ct = CASE_TYPES.find(c => c.code === req.caseType);
            return (
              <tr key={req.id} className="hover:bg-secondary/30 transition-colors">
                <td className="py-3 px-3 font-mono font-semibold text-foreground">{req.flightNumber}</td>
                <td className="py-3 px-3 text-foreground">{req.destination}</td>
                <td className="py-3 px-3">
                  <span className={`status-badge border ${ct?.color ?? 'bg-secondary text-muted-foreground border-border'}`}>
                    {req.caseType}
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-foreground">{req.quantity}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="w-3 h-3" />
                    {req.employeeName}
                  </div>
                </td>
                <td className="py-3 px-3 text-muted-foreground max-w-32 truncate">{req.notes || '-'}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(req.createdAt)}
                  </div>
                </td>
                {canDelete && (
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
