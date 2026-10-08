import { Plane, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Flight, CASE_TYPES } from '@/types';

interface Props {
  flight: Flight;
  caseCounts: Record<string, number>;
  totalCases: number;
  onClick?: () => void;
  selectable?: boolean;
}

export default function FlightCard({ flight, caseCounts, totalCases, onClick, selectable }: Props) {
  const activeCases = Object.entries(caseCounts).filter(([, q]) => q > 0);

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className={`bg-card border rounded-xl p-4 transition-all ${
        selectable ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]' : ''
      } ${totalCases > 0 ? 'border-border' : 'border-border/50'}`}
    >
      {/* Flight Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground font-mono">{flight.flightNumber}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {flight.destination}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {flight.departureTime}
          </div>
          {totalCases > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {totalCases} case{totalCases !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Case badges */}
      {activeCases.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeCases.map(([code, qty]) => {
            const ct = CASE_TYPES.find(c => c.code === code);
            return (
              <span key={code} className={`status-badge border text-xs ${ct?.color ?? 'bg-secondary text-muted-foreground border-border'}`}>
                {qty}× {code}
              </span>
            );
          })}
        </div>
      ) : (
        selectable && (
          <p className="text-xs text-muted-foreground mb-3">No requests yet</p>
        )
      )}

      {selectable && (
        <div className="flex items-center justify-end gap-1 text-xs text-primary font-medium">
          Add Request
          <ChevronRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
