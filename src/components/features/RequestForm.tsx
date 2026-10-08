import { useState } from 'react';
import { X, Send, Plane } from 'lucide-react';
import { Flight, CASE_TYPES, User } from '@/types';
import { addRequest } from '@/lib/storage';
import { toast } from 'sonner';

interface Props {
  flight: Flight;
  shiftId: string;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestForm({ flight, shiftId, user, onClose, onSuccess }: Props) {
  const [caseType, setCaseType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!caseType) { toast.error('Please select a case type.'); return; }
    if (quantity < 1) { toast.error('Quantity must be at least 1.'); return; }

    addRequest({
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      destination: flight.destination,
      departureTime: flight.departureTime,
      caseType,
      quantity,
      notes: notes.trim(),
      employeeId: user.id,
      employeeName: user.name,
      shiftId,
      status: 'pending',
    });

    toast.success(`Request submitted: ${quantity}× ${caseType} on ${flight.flightNumber}`);
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground font-mono">{flight.flightNumber}</p>
              <p className="text-xs text-muted-foreground">{flight.destination} · {flight.departureTime}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Case Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Case Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {CASE_TYPES.map(ct => (
                <button
                  key={ct.code}
                  type="button"
                  onClick={() => setCaseType(ct.code)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                    caseType === ct.code
                      ? `${ct.color} border-opacity-80 font-semibold`
                      : 'border-border bg-secondary/50 text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
                >
                  <span className="font-mono font-semibold">{ct.code}</span>
                  <span className="block text-xs opacity-80 mt-0.5">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg bg-secondary border border-border text-foreground font-bold text-lg flex items-center justify-center hover:border-primary/50"
              >−</button>
              <span className="w-10 text-center font-bold text-lg text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-lg bg-secondary border border-border text-foreground font-bold text-lg flex items-center justify-center hover:border-primary/50"
              >+</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional details..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
