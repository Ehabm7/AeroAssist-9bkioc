import { useState, useEffect } from 'react';
import { Users, UploadCloud, List, BarChart3, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import UserManagement from '@/components/features/UserManagement';
import ShiftUpload from '@/components/features/ShiftUpload';
import RequestsTable from '@/components/features/RequestsTable';
import ShiftReportView from '@/components/features/ShiftReportView';
import { getCurrentUser } from '@/lib/auth';
import { getShifts, getRequests, buildShiftReport, setActiveShift, deleteShift, ShiftReportData } from '@/lib/storage';
import { Shift } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type Tab = 'users' | 'shifts' | 'requests' | 'report';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tab, setTab] = useState<Tab>('users');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [requests, setRequests] = useState(getRequests());
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [report, setReport] = useState<ShiftReportData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login', { replace: true }); return; }
    setShifts(getShifts());
    setRequests(getRequests());
  }, [refreshKey]);

  if (!user) return null;

  function refresh() { setRefreshKey(k => k + 1); }

  function handleActivate(id: string) {
    setActiveShift(id);
    toast.success('Shift activated.');
    refresh();
  }

  function handleDeleteShift(id: string) {
    if (!confirm('Delete shift and all its flights?')) return;
    deleteShift(id);
    toast.success('Shift deleted.');
    refresh();
  }

  function handleGenerateReport() {
    if (!selectedShiftId) { toast.error('Select a shift first.'); return; }
    const r = buildShiftReport(selectedShiftId);
    if (!r) { toast.error('No data for this shift.'); return; }
    setReport(r);
  }

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'users', label: 'Users', Icon: Users },
    { id: 'shifts', label: 'Shifts', Icon: UploadCloud },
    { id: 'requests', label: 'Requests', Icon: List },
    { id: 'report', label: 'Reports', Icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-amber-500 text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.Icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && <UserManagement />}

        {/* Shifts Tab */}
        {tab === 'shifts' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-primary" />
                Upload New Shift
              </h2>
              <ShiftUpload user={user} onSuccess={refresh} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">All Shifts</h2>
              {shifts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No shifts uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {shifts.slice().reverse().map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-secondary/40 rounded-xl border border-border/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">{s.name}</span>
                          {s.isActive && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(s.createdAt)} · by {s.uploadedByName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!s.isActive && (
                          <button
                            onClick={() => handleActivate(s.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors font-medium"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteShift(s.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-red-400 hover:bg-destructive/20 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">All Requests ({requests.length})</h2>
              <button onClick={refresh} className="text-sm text-primary hover:underline">Refresh</button>
            </div>
            <RequestsTable requests={requests} canDelete onRefresh={refresh} />
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'report' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Generate Report
              </h2>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48">
                  <label className="block text-sm text-muted-foreground mb-1.5">Select Shift</label>
                  <select
                    value={selectedShiftId}
                    onChange={e => setSelectedShiftId(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">-- Choose a shift --</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
            {report && <ShiftReportView report={report} />}
          </div>
        )}
      </div>
    </div>
  );
}
