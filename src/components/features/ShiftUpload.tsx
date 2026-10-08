import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { parseFlightExcel } from '@/lib/excelParser';
import { createShift, addFlights } from '@/lib/storage';
import { User } from '@/types';
import { toast } from 'sonner';

interface Props { user: User; onSuccess: () => void; }

export default function ShiftUpload({ user, onSuccess }: Props) {
  const [shiftName, setShiftName] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ flightNumber: string; destination: string; departureTime: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFile(f);
    setLoading(true);
    try {
      const flights = await parseFlightExcel(f);
      setPreview(flights);
      if (flights.length === 0) toast.warning('No flight rows found. Check column headers.');
    } catch {
      toast.error('Failed to parse Excel file.');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file || preview.length === 0 || !shiftName.trim()) {
      toast.error('Please provide a shift name and a valid Excel file.');
      return;
    }
    const shift = createShift(shiftName.trim(), user.id, user.name);
    addFlights(shift.id, preview);
    toast.success(`Shift "${shift.name}" created with ${preview.length} flights.`);
    setShiftName(''); setFile(null); setPreview([]);
    if (inputRef.current) inputRef.current.value = '';
    onSuccess();
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Shift Name</label>
        <input
          type="text"
          value={shiftName}
          onChange={e => setShiftName(e.target.value)}
          placeholder="e.g. Morning Shift – 24 Sep 2026"
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {loading ? (
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
        ) : file ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
        ) : (
          <Upload className="w-8 h-8 text-muted-foreground mx-auto group-hover:text-primary transition-colors" />
        )}
        <p className="mt-2 text-sm font-medium text-foreground">
          {file ? file.name : 'Drop Excel file here or click to browse'}
        </p>
        {!file && <p className="text-xs text-muted-foreground mt-1">Supports .xlsx / .xls / .csv</p>}
      </div>

      {preview.length > 0 && (
        <div className="bg-secondary/40 rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-foreground">{preview.length} flights detected</span>
          </div>
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-secondary/80">
                <tr>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">Flight</th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">Destination</th>
                  <th className="text-left py-2 px-4 text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {preview.map((f, i) => (
                  <tr key={i}>
                    <td className="py-2 px-4 font-mono font-semibold text-foreground">{f.flightNumber}</td>
                    <td className="py-2 px-4 text-foreground">{f.destination}</td>
                    <td className="py-2 px-4 text-muted-foreground">{f.departureTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <button
          onClick={handleUpload}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Create Shift &amp; Upload {preview.length} Flights
        </button>
      )}
    </div>
  );
}
