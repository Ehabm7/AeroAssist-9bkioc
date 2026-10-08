import { Flight, Shift, ServiceRequest } from '@/types';
import { generateId } from '@/lib/utils';

const SHIFTS_KEY = 'aero_shifts';
const FLIGHTS_KEY = 'aero_flights';
const REQUESTS_KEY = 'aero_requests';

// ── Shifts ──────────────────────────────────────────────────────────────────
export function getShifts(): Shift[] {
  const raw = localStorage.getItem(SHIFTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveShifts(shifts: Shift[]) {
  localStorage.setItem(SHIFTS_KEY, JSON.stringify(shifts));
}
export function createShift(name: string, uploadedBy: string, uploadedByName: string): Shift {
  const shift: Shift = {
    id: generateId(), name, uploadedBy, uploadedByName,
    isActive: true, createdAt: new Date().toISOString(),
  };
  const existing = getShifts().map(s => ({ ...s, isActive: false }));
  saveShifts([...existing, shift]);
  return shift;
}
export function setActiveShift(shiftId: string) {
  saveShifts(getShifts().map(s => ({ ...s, isActive: s.id === shiftId })));
}
export function deleteShift(shiftId: string) {
  saveShifts(getShifts().filter(s => s.id !== shiftId));
  saveFlights(getFlights().filter(f => f.shiftId !== shiftId));
}
export function getActiveShift(): Shift | null {
  return getShifts().find(s => s.isActive) ?? null;
}

// ── Flights ──────────────────────────────────────────────────────────────────
export function getFlights(): Flight[] {
  const raw = localStorage.getItem(FLIGHTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveFlights(flights: Flight[]) {
  localStorage.setItem(FLIGHTS_KEY, JSON.stringify(flights));
}
export function addFlights(shiftId: string, rows: { flightNumber: string; destination: string; departureTime: string }[]): Flight[] {
  const newFlights: Flight[] = rows.map(r => ({ id: generateId(), shiftId, ...r }));
  saveFlights([...getFlights(), ...newFlights]);
  return newFlights;
}
export function getFlightsByShift(shiftId: string): Flight[] {
  return getFlights().filter(f => f.shiftId === shiftId);
}

// ── Requests ──────────────────────────────────────────────────────────────────
export function getRequests(): ServiceRequest[] {
  const raw = localStorage.getItem(REQUESTS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveRequests(reqs: ServiceRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
}
export function addRequest(data: Omit<ServiceRequest, 'id' | 'createdAt'>): ServiceRequest {
  const req: ServiceRequest = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  saveRequests([...getRequests(), req]);
  return req;
}
export function deleteRequest(id: string) {
  saveRequests(getRequests().filter(r => r.id !== id));
}
export function getRequestsByShift(shiftId: string): ServiceRequest[] {
  return getRequests().filter(r => r.shiftId === shiftId);
}
export function getRequestsByEmployee(employeeId: string): ServiceRequest[] {
  return getRequests().filter(r => r.employeeId === employeeId);
}

// ── Report ────────────────────────────────────────────────────────────────────
export interface ShiftReportData {
  shift: Shift;
  flights: { flight: Flight; cases: { caseType: string; qty: number }[]; total: number }[];
  caseBreakdown: { caseType: string; total: number }[];
  grandTotal: number;
  generatedAt: string;
}
export function buildShiftReport(shiftId: string): ShiftReportData | null {
  const shift = getShifts().find(s => s.id === shiftId);
  if (!shift) return null;
  const flights = getFlightsByShift(shiftId);
  const requests = getRequestsByShift(shiftId);

  const flightRows = flights.map(flight => {
    const fReqs = requests.filter(r => r.flightId === flight.id);
    const caseMap: Record<string, number> = {};
    fReqs.forEach(r => { caseMap[r.caseType] = (caseMap[r.caseType] || 0) + r.quantity; });
    const cases = Object.entries(caseMap).map(([caseType, qty]) => ({ caseType, qty }));
    return { flight, cases, total: fReqs.reduce((s, r) => s + r.quantity, 0) };
  });

  const caseMap: Record<string, number> = {};
  requests.forEach(r => { caseMap[r.caseType] = (caseMap[r.caseType] || 0) + r.quantity; });
  const caseBreakdown = Object.entries(caseMap).map(([caseType, total]) => ({ caseType, total }));

  return {
    shift,
    flights: flightRows,
    caseBreakdown,
    grandTotal: requests.reduce((s, r) => s + r.quantity, 0),
    generatedAt: new Date().toISOString(),
  };
}
