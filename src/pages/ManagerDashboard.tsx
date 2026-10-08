import { useState, useEffect } from 'react';
import { UploadCloud, List, BarChart3, Layers, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import ShiftUpload from '@/components/features/ShiftUpload';
import FlightCard from '@/components/features/FlightCard';
import RequestsTable from '@/components/features/RequestsTable';
import ShiftReportView from '@/components/features/ShiftReportView';
import { getCurrentUser } from '@/lib/auth';
import { getShifts, getFlightsByShift, getRequests, getRequestsByShift, buildShiftReport, setActiveShift, ShiftReportData } from '@/lib/storage';
import { Shift, Flight } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type Tab = 'flights' | 'upload' | 'requests' | 'report';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tab, setTab] = useState<Tab>('flights');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [requests, setRequests] = useState(getRequests());
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [report, setReport] = useState<ShiftReportData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'manager') { navigate('/login', { replace: true }); return; }
    const all = getShifts();
    setShifts(all);
    setRequests(getRequests());
    const active = all.find(s => s.isActive);
    if (active) setFlights(getFlightsByShift(active.id));
    else setFlights([]);
  }, [refreshKey]);

  if (!user) return null;
  function refresh() { setRefreshKey(k => k + 1); }

  const activeShift = shifts.find(s => s.isActive);
  const activeRequests = activeShift ? getRequestsByShift(activeShift.id) : [];

  function getCaseCounts(flightId: string) {
    const fReqs = requests.filter(r => r.flightId === flightId);
    const map: Record<string, number> = {};
    fReqs.forEach(r => { map[r.caseType] = (map[r.caseType] || 0) + r.quantity; });
    return { counts: map, total: fReqs.reduce((s, r) => s + r.quantity, 0) };
  }

  function handleGenerateReport() {
    if (!selectedShiftId) { toast.error('Select a shift first.'); return; }
    const r = buildShiftReport(selectedShiftId);
    if (!r) { toast.error('No data found.'); return; }
    setReport(r);
  }

  const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'flights', label: 'Flights', Icon: Layers },
    { id: 'upload', label: 'Upload Shift', Icon: UploadCloud },
    { id: 'requests', label: 'Requests', Icon: List },
    { id: 'report', label: 'Report', Icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Active Shift Banner */}
        {activeShift && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Active Shift: </span>
              <span className="font-semibold text-foreground">{activeShift.name}</span>
              <span className="text-muted-foreground ml-2">· {flights.length} flights · {activeRequests.length} requests</span>
            </div>
          </div>
        )}

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

        {/* Flights Tab */}
        {tab === 'flights' && (
          <div>
            {!activeShift ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No active shift. Upload an Excel sheet to start.</p>
                <button onClick={() => setTab('upload')} className="mt-3 text-sm text-amber-400 hover:underline">Upload Shift →</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground">{activeShift.name} — Flights ({flights.length})</h2>
                  <button onClick={refresh} className="text-sm text-primary hover:underline">Refresh</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {flights.map(f => {
                    const { counts, total } = getCaseCounts(f.id);
                    return <FlightCard key={f.id} flight={f} caseCounts={counts} totalCases={total} />;
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {tab === 'upload' && (
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
                <p className="text-muted-foreground text-sm">No shifts yet.</p>
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
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(s.createdAt)}</p>
                      </div>
                      {!s.isActive && (
                        <button
                          onClick={() => { setActiveShift(s.id); toast.success('Shift activated.'); refresh(); }}
                          className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors font-medium"
                        >
                          Activate
                        </button>
                      )}
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
            <RequestsTable requests={requests} onRefresh={refresh} />
          </div>
        )}

        {/* Report Tab */}
        {tab === 'report' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Generate Shift Report
              </h2>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48">
                  <select
                    value={selectedShiftId}
                    onChange={e => setSelectedShiftId(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="">-- Select shift --</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
            {report && <ShiftReportView report={report} />}
          </div>
        )}
      </div>
    </div>
  );
}
