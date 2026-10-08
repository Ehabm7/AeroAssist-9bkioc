import { Printer, Plane, BarChart3, Clock, FileText } from 'lucide-react';
import { ShiftReportData } from '@/lib/storage';
import { CASE_TYPES } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface Props { report: ShiftReportData; }

export default function ShiftReportView({ report }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{report.shift.name}</h2>
            <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Generated: {formatDateTime(report.generatedAt)}
              </span>
              <span>Uploaded by: {report.shift.uploadedByName}</span>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Flights', value: report.flights.length, color: 'text-amber-400' },
          { label: 'Flights w/ Requests', value: report.flights.filter(f => f.total > 0).length, color: 'text-cyan-400' },
          { label: 'Total Cases', value: report.grandTotal, color: 'text-emerald-400' },
          { label: 'Case Types', value: report.caseBreakdown.length, color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Case Breakdown */}
      {report.caseBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Case Type Breakdown
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.caseBreakdown.sort((a, b) => b.total - a.total).map(cb => {
              const ct = CASE_TYPES.find(c => c.code === cb.caseType);
              return (
                <span key={cb.caseType} className={`status-badge border ${ct?.color ?? 'bg-secondary text-muted-foreground border-border'}`}>
                  {cb.caseType}: {cb.total}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-Flight Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Flight Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Flight</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cases Requested</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {report.flights.map(({ flight, cases, total }) => (
                <tr key={flight.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">{flight.flightNumber}</td>
                  <td className="py-3 px-4 text-foreground">{flight.destination}</td>
                  <td className="py-3 px-4 text-muted-foreground">{flight.departureTime}</td>
                  <td className="py-3 px-4">
                    {cases.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cases.map(c => {
                          const ct = CASE_TYPES.find(t => t.code === c.caseType);
                          return (
                            <span key={c.caseType} className={`status-badge border text-xs ${ct?.color ?? 'bg-secondary text-muted-foreground border-border'}`}>
                              {c.qty}× {c.caseType}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No requests</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {total > 0
                      ? <span className="font-bold text-primary">{total}</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
