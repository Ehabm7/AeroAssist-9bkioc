import { useState, useEffect } from 'react';
import { Layers, List, Plane } from 'lucide-react';
import Header from '@/components/layout/Header';
import FlightCard from '@/components/features/FlightCard';
import RequestForm from '@/components/features/RequestForm';
import RequestsTable from '@/components/features/RequestsTable';
import { getCurrentUser } from '@/lib/auth';
import { getActiveShift, getFlightsByShift, getRequestsByEmployee, getRequests } from '@/lib/storage';
import { Flight, Shift } from '@/types';
import { useNavigate } from 'react-router-dom';

type Tab = 'flights' | 'my-requests';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tab, setTab] = useState<Tab>('flights');
  const [activeShift, setActiveShift_] = useState<Shift | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [myRequests, setMyRequests] = useState(user ? getRequestsByEmployee(user.id) : []);
  const [allRequests, setAllRequests] = useState(getRequests());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'employee') { navigate('/login', { replace: true }); return; }
    const shift = getActiveShift();
    setActiveShift_(shift);
    if (shift) setFlights(getFlightsByShift(shift.id));
    else setFlights([]);
    setMyRequests(getRequestsByEmployee(user.id));
    setAllRequests(getRequests());
  }, [refreshKey]);

  if (!user) return null;
  function refresh() { setRefreshKey(k => k + 1); }

  function getCaseCounts(flightId: string) {
    const fReqs = allRequests.filter(r => r.flightId === flightId);
    const map: Record<string, number> = {};
    fReqs.forEach(r => { map[r.caseType] = (map[r.caseType] || 0) + r.quantity; });
    return { counts: map, total: fReqs.reduce((s, r) => s + r.quantity, 0) };
  }

  const TABS: { id: Tab; label: string; Icon: React.ElementType; count?: number }[] = [
    { id: 'flights', label: 'Flights', Icon: Layers, count: flights.length },
    { id: 'my-requests', label: 'My Requests', Icon: List, count: myRequests.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Shift info */}
        {activeShift ? (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm">
            <Plane className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-muted-foreground">Current Shift: </span>
            <span className="font-semibold text-foreground">{activeShift.name}</span>
          </div>
        ) : (
          <div className="p-3 bg-secondary/60 border border-border/60 rounded-xl text-sm text-muted-foreground">
            No active shift. Waiting for manager to upload.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
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
              {t.count !== undefined && t.count > 0 && (
                <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Flights Tab */}
        {tab === 'flights' && (
          <div>
            {flights.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">No flights available for the current shift.</p>
                <p className="text-muted-foreground text-sm mt-1">Wait for a manager to upload the shift schedule.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">Click a flight to submit a special assistance request.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {flights.map(f => {
                    const { counts, total } = getCaseCounts(f.id);
                    return (
                      <FlightCard
                        key={f.id}
                        flight={f}
                        caseCounts={counts}
                        totalCases={total}
                        selectable
                        onClick={() => setSelectedFlight(f)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {tab === 'my-requests' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">My Requests ({myRequests.length})</h2>
            <RequestsTable requests={myRequests} onRefresh={refresh} emptyLabel="You have not submitted any requests yet." />
          </div>
        )}
      </div>

      {/* Request Form Modal */}
      {selectedFlight && activeShift && (
        <RequestForm
          flight={selectedFlight}
          shiftId={activeShift.id}
          user={user}
          onClose={() => setSelectedFlight(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
