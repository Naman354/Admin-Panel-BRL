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

export function isParticipantPresent(p?: any): boolean {
  if (!p) return false;

  const truthyStrings = new Set([
    'true',
    'present',
    'yes',
    'y',
    '1',
    'marked',
    'attended',
    'checked-in',
    'checkedin',
    'checkin',
    'checked_in',
    'p',
    'success',
  ]);

  if (p.attendance) {
    if (typeof p.attendance === 'boolean') return p.attendance;
    if (typeof p.attendance === 'string') {
      const s = p.attendance.trim().toLowerCase();
      if (truthyStrings.has(s)) return true;
    }
    if (typeof p.attendance === 'object') {
      if (typeof p.attendance.marked === 'boolean') return p.attendance.marked;
      if (p.attendance.present || p.attendance.isPresent || p.attendance.attended || p.attendance.checkedIn) return true;
      if (typeof p.attendance.status === 'string' && truthyStrings.has(p.attendance.status.trim().toLowerCase())) return true;
    }
  }

  if (p.isPresent === true || p.present === true || p.attended === true || p.checkedIn === true) return true;
  if (typeof p.status === 'string' && truthyStrings.has(p.status.trim().toLowerCase())) return true;
  if (typeof p.attendanceStatus === 'string' && truthyStrings.has(p.attendanceStatus.trim().toLowerCase())) return true;

  return Boolean(p.attendance?.marked);
}

export interface TimelineItem {
  date: string;
  count: number;
  time?: string;
  day?: string;
  cumulative?: number;
}

export interface OtherDaySummary {
  date: string;
  label: string;
  count: number;
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
  timeline: TimelineItem[];
  otherDaysSummary?: OtherDaySummary[];
  otherDaysTotal?: number;
  peakDaysTotal?: number;
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
