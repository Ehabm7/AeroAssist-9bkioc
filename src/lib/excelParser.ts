import * as XLSX from 'xlsx';

export interface ParsedFlight {
  flightNumber: string;
  destination: string;
  departureTime: string;
}

/** Try to match a header row to expected columns (flexible, case-insensitive) */
function matchCol(headers: string[], candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h?.toString().toLowerCase().includes(c.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

/** Check if a cell value looks like a flight number (e.g. "MS 0937", "EK 201") */
function isFlightNumber(val: string): boolean {
  return /^[A-Z0-9]{2,3}\s*\d{2,4}$/i.test(val.trim());
}

/** Check if a cell value looks like a 3-letter airport IATA code or destination */
function isIATA(val: string): boolean {
  return /^[A-Z]{3}(-[A-Z]{3})*$/i.test(val.trim());
}

/** Check if a cell value looks like a time (HH:MM) */
function isTime(val: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(val.trim());
}

export function parseFlightExcel(file: File): Promise<ParsedFlight[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellText: true, cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

        console.log('Excel rows count:', rows.length);
        console.log('First 12 rows sample:', rows.slice(0, 12));

        if (rows.length < 2) { resolve([]); return; }

        // ── Strategy 1: Find header row containing "FLT", "Dest", etc. ──
        let headerRowIdx = -1;
        let fnCol = -1, destCol = -1, timeCol = -1;

        for (let i = 0; i < Math.min(15, rows.length); i++) {
          const cells = rows[i].map(h => h?.toString() ?? '');
          const flt = matchCol(cells, ['flt', 'flight', 'رحل', 'رقم', 'flight no', 'no']);
          const dest = matchCol(cells, ['dest', 'وجه', 'destination', 'station']);
          if (flt !== -1 && dest !== -1) {
            headerRowIdx = i;
            fnCol = flt;
            destCol = dest;
            const timeInSame = matchCol(cells, ['time', 'std', 'etd', 'depart', 'وقت']);
            if (timeInSame !== -1) {
              timeCol = timeInSame;
            } else if (i + 1 < rows.length) {
              const nextCells = rows[i + 1].map(h => h?.toString() ?? '');
              const stdIdx = matchCol(nextCells, ['std', 'time', 'etd']);
              timeCol = stdIdx !== -1 ? stdIdx : fnCol + 4;
            }
            console.log(`Header found at row ${i}: fnCol=${fnCol}, destCol=${destCol}, timeCol=${timeCol}`);
            break;
          }
        }

        // ── Strategy 2: Auto-detect by scanning for rows with flight-number pattern ──
        if (headerRowIdx === -1) {
          console.log('Header not found by keywords — attempting auto-detect...');
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (let j = 0; j < row.length; j++) {
              const val = row[j]?.toString().trim();
              if (val && isFlightNumber(val)) {
                headerRowIdx = i - 1;
                fnCol = j;
                for (let k = j + 1; k < row.length; k++) {
                  if (isIATA(row[k]?.toString().trim())) { destCol = k; break; }
                }
                for (let k = j + 1; k < row.length; k++) {
                  if (isTime(row[k]?.toString().trim())) { timeCol = k; break; }
                }
                console.log(`Auto-detect: data starts row ${i}, fnCol=${fnCol}, destCol=${destCol}, timeCol=${timeCol}`);
                break;
              }
            }
            if (headerRowIdx !== -1) break;
          }
        }

        // ── Strategy 3: EgyptAir DEP sheet hardcoded layout ──
        if (headerRowIdx === -1) {
          console.log('Trying EgyptAir DEP sheet hardcoded layout...');
          const allText = rows.flat().map(c => c?.toString() ?? '').join(' ');
          if (allText.includes('DEP') || allText.includes('مصر للطيران') || allText.includes('STAFF')) {
            headerRowIdx = 9;
            fnCol = 1;
            destCol = 2;
            timeCol = 5;
            console.log('EgyptAir DEP sheet detected — using fixed columns:', { fnCol, destCol, timeCol });
          }
        }

        // ── Final fallback ──
        if (headerRowIdx === -1) {
          headerRowIdx = 0;
          fnCol = 0; destCol = 1; timeCol = 2;
          console.warn('All strategies failed — using fallback cols 0,1,2');
        }

        const dataStartRow = headerRowIdx + 1;
        const flights: ParsedFlight[] = [];

        for (let i = dataStartRow; i < rows.length; i++) {
          const row = rows[i];
          const fn = row[fnCol]?.toString().trim();
          const dst = row[destCol]?.toString().trim();
          const tm = timeCol !== -1 ? row[timeCol]?.toString().trim() : '';

          if (!fn || !dst) continue;
          if (fn.toLowerCase().includes('flt') || fn.toLowerCase().includes('no')) continue;
          if (!isFlightNumber(fn)) continue;

          flights.push({
            flightNumber: fn.replace(/\s+/, ' ').toUpperCase(),
            destination: dst.toUpperCase(),
            departureTime: tm && isTime(tm) ? tm : (tm || '-'),
          });
        }

        console.log(`Parsed ${flights.length} flights.`, flights.slice(0, 3));
        resolve(flights);
      } catch (err) {
        console.error('Excel parse error:', err);
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
