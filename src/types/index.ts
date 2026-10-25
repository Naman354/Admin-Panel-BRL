export function computeYearFromStudentNumber(studentNumber?: string | number | null): number | null {
  const str = String(studentNumber || '').trim();
  if (str.startsWith('24')) return 3;
  if (str.startsWith('25')) return 2;
  return null;
}

export function getParticipantYear(p?: { year?: number | string | null; studentNumber?: string; studentNo?: string; rollNo?: string } | null): number | string | null {
  if (!p) return null;
  if (p.year !== undefined && p.year !== null) {
    return p.year;
  }
  return computeYearFromStudentNumber(p.studentNumber || p.studentNo || p.rollNo);
}

export function formatYear(year: number | string | null | undefined): string {
  if (
    year === null ||
    year === undefined ||
    String(year).trim() === '' ||
    String(year).trim().toLowerCase() === 'null' ||
    String(year).trim().toLowerCase() === 'undefined'
  ) {
    return 'null';
  }
  const str = String(year).trim();
  return str.toLowerCase().includes('year') ? str : `Year ${str}`;
}

export interface Participant {
  _id?: string;
  studentNumber: string;
  studentNo?: string;
  rollNo?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  branch: string;
  year: number | string | null;
  gender: 'Male' | 'Female' | 'Other';
  residency: 'Hosteler' | 'Day Scholar';
  barcode: string;
  category?: 'Student' | 'VIP' | 'Delegate' | 'Volunteer';
  tShirtSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  attendance: {
    marked: boolean;
    markedAt: string | null;
    markedMethod: 'BARCODE' | 'MANUAL' | null;
    markedBy: string | null;
  };
  registeredAt: string;
}

export interface MetricsData {
  overview: {
    totalRegistrations: number;
    totalPresent: number;
    totalAbsent: number;
    attendanceRate: number;
    barcodeScans: number;
    manualCheckIns: number;
  };
  genderDistribution: {
    name: string;
    count: number;
    percentage: number;
  }[];
  residencyDistribution: {
    name: string;
    count: number;
    percentage: number;
  }[];
  branchDistribution: {
    name: string;
    total: number;
    present: number;
    percentage: number;
  }[];
  yearDistribution: {
    name: string;
    year: number;
    count: number;
    percentage: number;
  }[];
  recentCheckIns: Participant[];
  timeline: {
    date: string;
    count: number;
  }[];
}

export interface AttendanceResult {
  success: boolean;
  message: string;
  error?: 'PARTICIPANT_NOT_FOUND' | 'ALREADY_MARKED' | 'MISSING_IDENTIFIER' | string;
  participant?: Participant;
}

export interface DatabaseStatus {
  isMongoConnected: boolean;
  mode: string;
  mongoConnectionError: string | null;
  uriConfigured: boolean;
}
