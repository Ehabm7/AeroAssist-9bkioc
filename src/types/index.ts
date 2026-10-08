export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Shift {
  id: string;
  name: string;
  uploadedBy: string;
  uploadedByName: string;
  isActive: boolean;
  createdAt: string;
}

export interface Flight {
  id: string;
  shiftId: string;
  flightNumber: string;
  destination: string;
  departureTime: string;
}

export interface CaseType {
  code: string;
  label: string;
  color: string;
}

export const CASE_TYPES: CaseType[] = [
  { code: 'WCHR', label: 'Wheelchair - Ramp', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { code: 'WCHC', label: 'Wheelchair - Cabin', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
  { code: 'WCHS', label: 'Wheelchair - Steps', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { code: 'BLND', label: 'Blind Passenger', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { code: 'DEAF', label: 'Deaf Passenger', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { code: 'UMNR', label: 'Unaccompanied Minor', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { code: 'MEDA', label: 'Medical Case', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
  { code: 'OXYG', label: 'Oxygen Required', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { code: 'STCR', label: 'Stretcher', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { code: 'MAAS', label: 'Meet and Assist', color: 'bg-green-500/20 text-green-300 border-green-500/40' },
];

export interface ServiceRequest {
  id: string;
  flightId: string;
  flightNumber: string;
  destination: string;
  departureTime: string;
  caseType: string;
  quantity: number;
  notes: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  status: 'pending' | 'acknowledged' | 'completed';
  createdAt: string;
}
