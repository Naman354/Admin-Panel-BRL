import mongoose from 'mongoose';
import { RegistrationModel } from './models/Participant.js';

let isMongoConnected = false;
let mongoConnectionError: string | null = null;
let activeDbName = 'EXPERT-SEMINAR-REGISTRATION';

export function getYearFromStudent(doc: any): number | null {
  const raw = typeof doc === 'string' ? doc : (doc?.studentNumber || doc?.studentNo || doc?.rollNo || '');
  const str = String(raw).trim();
  if (str.startsWith('24')) return 3;
  if (str.startsWith('25')) return 2;
  return null;
}

export function getResidency(doc: any): 'Hosteler' | 'Day Scholar' {
  if (typeof doc.hosteller === 'boolean') {
    return doc.hosteller ? 'Hosteler' : 'Day Scholar';
  }
  if (typeof doc.residency === 'string') {
    return doc.residency.toLowerCase().includes('hostel') ? 'Hosteler' : 'Day Scholar';
  }
  return 'Day Scholar';
}

export function isAttendancePresent(doc: any): boolean {
  if (!doc) return false;

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

  const falsyStrings = new Set([
    'false',
    'absent',
    'no',
    'n',
    '0',
    'unmarked',
    'not-attended',
    'not_attended',
    'pending',
    'a',
    '',
    'null',
    'undefined',
  ]);

  const evaluateValue = (val: any): boolean | null => {
    if (val === true || val === 1) return true;
    if (val === false || val === 0 || val === null || val === undefined) return false;

    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      if (truthyStrings.has(s)) return true;
      if (falsyStrings.has(s)) return false;

      // Check if it's an ISO timestamp / date string indicating attendance was marked
      if (
        (s.includes('t') || s.includes(':') || s.includes('-') || s.includes('/')) &&
        !isNaN(Date.parse(s))
      ) {
        return true;
      }
    }

    if (val instanceof Date && !isNaN(val.getTime())) {
      return true;
    }

    return null;
  };

  // 1. Check top-level boolean/string status fields
  const directFields = [
    doc.isPresent,
    doc.is_present,
    doc.present,
    doc.attended,
    doc.isAttended,
    doc.is_attended,
    doc.hasAttended,
    doc.checkedIn,
    doc.checked_in,
    doc.checkIn,
    doc.check_in,
    doc.marked,
    doc.isMarked,
    doc.is_marked,
    doc.status,
    doc.attendanceStatus,
    doc.attendance_status,
    doc.checkInStatus,
    doc.check_in_status,
  ];

  for (const f of directFields) {
    const res = evaluateValue(f);
    if (res === true) return true;
  }

  // 2. Check doc.attendance
  const att = doc.attendance;
  if (att !== undefined && att !== null) {
    const attRes = evaluateValue(att);
    if (attRes === true) return true;

    if (Array.isArray(att)) {
      return att.length > 0;
    }

    if (typeof att === 'object') {
      const nestedFields = [
        att.marked,
        att.isMarked,
        att.is_marked,
        att.present,
        att.isPresent,
        att.is_present,
        att.status,
        att.state,
        att.attended,
        att.isAttended,
        att.checkedIn,
        att.checked_in,
        att.checkIn,
        att.check_in,
        att.value,
      ];
      for (const nf of nestedFields) {
        const res = evaluateValue(nf);
        if (res === true) return true;
      }

      // Check nested timestamp fields
      const nestedTimeFields = [
        att.markedAt,
        att.marked_at,
        att.time,
        att.timestamp,
        att.date,
        att.checkInTime,
        att.checkedInAt,
        att.attendanceTime,
      ];
      for (const ntf of nestedTimeFields) {
        if (ntf && evaluateValue(ntf) === true) return true;
      }
    }
  }

  // 3. Check top-level timestamp fields indicating check-in
  const timestampFields = [
    doc.lastMarkedAt,
    doc.last_marked_at,
    doc.markedAt,
    doc.marked_at,
    doc.checkInTime,
    doc.check_in_time,
    doc.checkedInAt,
    doc.checked_in_at,
    doc.attendedAt,
    doc.attended_at,
    doc.attendanceTime,
    doc.attendance_time,
  ];

  for (const tf of timestampFields) {
    if (tf && evaluateValue(tf) === true) return true;
  }

  return false;
}

export function getAttendanceMarkedAt(doc: any): string | null {
  const candidates = [
    doc.lastMarkedAt,
    doc.last_marked_at,
    doc.markedAt,
    doc.marked_at,
    doc.checkInTime,
    doc.check_in_time,
    doc.checkedInAt,
    doc.checked_in_at,
    doc.attendedAt,
    doc.attended_at,
    doc.attendanceTime,
    doc.attendance_time,
    doc.attendance?.markedAt,
    doc.attendance?.marked_at,
    doc.attendance?.time,
    doc.attendance?.timestamp,
    doc.attendance?.date,
    doc.attendance?.checkInTime,
    doc.attendance?.checkedInAt,
  ];

  if (typeof doc.attendance === 'string') {
    const s = doc.attendance.trim();
    if (
      (s.includes('T') || s.includes(':') || s.includes('-') || s.includes('/')) &&
      !isNaN(Date.parse(s))
    ) {
      candidates.push(s);
    }
  }

  for (const c of candidates) {
    if (c) {
      const parsed = new Date(c);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
  }

  return null;
}

export function getAttendanceMethod(doc: any, isMarked: boolean): 'BARCODE' | 'MANUAL' | null {
  if (!isMarked) return null;

  const raw =
    doc.markedMethod ||
    doc.marked_method ||
    doc.method ||
    doc.checkInMethod ||
    doc.check_in_method ||
    doc.attendance?.markedMethod ||
    doc.attendance?.marked_method ||
    doc.attendance?.method;

  if (typeof raw === 'string') {
    const s = raw.trim().toUpperCase();
    if (s.includes('MANUAL')) return 'MANUAL';
    if (s.includes('BARCODE') || s.includes('SCAN') || s.includes('QR')) return 'BARCODE';
  }

  return 'BARCODE';
}

export function getAttendance(doc: any) {
  const isMarked = isAttendancePresent(doc);
  let markedAt = getAttendanceMarkedAt(doc);

  // If marked present by an external source without explicit check-in timestamp,
  // fallback to document updatedAt or createdAt
  if (isMarked && !markedAt) {
    if (doc.updatedAt) {
      const u = new Date(doc.updatedAt);
      if (!isNaN(u.getTime())) markedAt = u.toISOString();
    } else if (doc.createdAt) {
      const c = new Date(doc.createdAt);
      if (!isNaN(c.getTime())) markedAt = c.toISOString();
    }
  }

  const markedMethod = getAttendanceMethod(doc, isMarked);
  const markedBy =
    doc.markedBy ||
    doc.marked_by ||
    doc.attendance?.markedBy ||
    doc.attendance?.marked_by ||
    doc.attendance?.by ||
    'admin';

  return {
    marked: isMarked,
    markedAt,
    markedMethod,
    markedBy: String(markedBy),
  };
}

export function mapRegistrationDoc(doc: any) {
  const studentNum = doc.studentNo || doc.studentNumber || doc.rollNo || String(doc._id);
  const rollNum = doc.rollNo || doc.studentNo || '';
  const fullName = doc.name || doc.fullName || 'Participant';
  const attendance = getAttendance(doc);
  const residency = getResidency(doc);
  const year = getYearFromStudent(doc);

  return {
    _id: String(doc._id),
    studentNumber: studentNum,
    studentNo: doc.studentNo || studentNum,
    rollNo: rollNum,
    fullName,
    email: doc.email || '',
    phoneNumber: doc.phone || doc.phoneNumber || '',
    branch: doc.branch || 'General',
    year,
    gender: (doc.gender || 'Male') as 'Male' | 'Female' | 'Other',
    residency,
    hosteller: typeof doc.hosteller === 'boolean' ? doc.hosteller : residency === 'Hosteler',
    barcode: doc.studentNo || doc.rollNo || studentNum,
    category: (doc.category || 'Student') as any,
    tShirtSize: (doc.tShirtSize || 'M') as any,
    attendance,
    registeredAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export async function initDatabase() {
  if (mongoose.connection.readyState >= 1) {
    isMongoConnected = true;
    return;
  }

  const uri = process.env.MONGODB_URI;
  activeDbName = process.env.DB_NAME || 'EXPERT-SEMINAR-REGISTRATION';

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in .env');
    isMongoConnected = false;
    mongoConnectionError = 'Missing MONGODB_URI in .env';
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      dbName: activeDbName,
      serverSelectionTimeoutMS: 10000,
    });
    isMongoConnected = true;
    mongoConnectionError = null;

    const count = await RegistrationModel.countDocuments();
    console.log(`✅ Connected successfully to live MongoDB [${activeDbName}]`);
    console.log(`📊 Live registrations collection has ${count} records.`);
  } catch (err: any) {
    isMongoConnected = false;
    mongoConnectionError = err?.message || 'Failed to connect to MongoDB';
    console.error(`❌ MongoDB connection failed: ${mongoConnectionError}`);
  }
}

export function getConnectionStatus() {
  return {
    isMongoConnected,
    mode: isMongoConnected ? `Live MongoDB [${activeDbName}]` : 'Disconnected',
    mongoConnectionError,
    uriConfigured: Boolean(process.env.MONGODB_URI),
    databaseName: activeDbName,
  };
}

export async function getAllParticipants(query?: {
  search?: string;
  branch?: string;
  year?: string;
  gender?: string;
  residency?: string;
  attendance?: string;
}) {
  const filter: any = {};

  if (query?.search && query.search.trim()) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { name: regex },
      { fullName: regex },
      { studentNo: regex },
      { rollNo: regex },
      { studentNumber: regex },
      { email: regex },
      { phone: regex },
      { phoneNumber: regex },
    ];
  }

  if (query?.branch && query.branch !== 'All') {
    filter.branch = new RegExp(`^${query.branch}$`, 'i');
  }

  if (query?.gender && query.gender !== 'All') {
    filter.gender = query.gender;
  }

  if (query?.residency && query.residency !== 'All') {
    if (query.residency === 'Hosteler') {
      filter.$or = [{ hosteller: true }, { residency: 'Hosteler' }];
    } else {
      filter.$or = [{ hosteller: false }, { residency: 'Day Scholar' }];
    }
  }

  const rawDocs = await RegistrationModel.find(filter).sort({ createdAt: -1 }).lean();
  let results = rawDocs.map(mapRegistrationDoc);

  // Accurate multi-format attendance filtering in memory
  if (query?.attendance && query.attendance !== 'All') {
    const targetPresent = query.attendance === 'Present';
    results = results.filter((p) => p.attendance.marked === targetPresent);
  }

  if (query?.year && query.year !== 'All') {
    if (query.year === 'null') {
      results = results.filter((p) => p.year === null || p.year === undefined);
    } else {
      const targetYear = Number(query.year);
      results = results.filter((p) => p.year === targetYear || String(p.year) === query.year);
    }
  }

  return results;
}

export async function findParticipant(identifier: string) {
  const cleanId = identifier.trim();

  const query: any = {
    $or: [
      { studentNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { rollNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { studentNumber: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { barcode: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
    ],
  };

  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    query.$or.push({ _id: new mongoose.Types.ObjectId(cleanId) });
  }

  const raw = await RegistrationModel.findOne(query).lean();
  return raw ? mapRegistrationDoc(raw) : null;
}

export async function markAttendance(
  identifier: string,
  method: 'BARCODE' | 'MANUAL' = 'BARCODE',
  markedBy = 'admin'
) {
  const cleanId = identifier.trim();

  const query: any = {
    $or: [
      { studentNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { rollNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { studentNumber: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { barcode: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
    ],
  };

  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    query.$or.push({ _id: new mongoose.Types.ObjectId(cleanId) });
  }

  const participant = await RegistrationModel.findOne(query);

  if (!participant) {
    return {
      success: false,
      error: 'PARTICIPANT_NOT_FOUND',
      message: `No participant found matching Roll / Barcode '${cleanId}'`,
    };
  }

  // STRICT SINGLE CHECK-IN RULE: Check if already marked present across all formats
  const isAlreadyMarked = isAttendancePresent(participant.toObject());

  if (isAlreadyMarked) {
    const mapped = mapRegistrationDoc(participant.toObject());
    return {
      success: false,
      error: 'ALREADY_MARKED',
      message: `Attendance has ALREADY been marked for ${mapped.fullName} (${mapped.studentNumber})`,
      participant: mapped,
    };
  }

  const now = new Date();
  participant.isPresent = true;
  participant.present = true;
  participant.lastMarkedAt = now;
  participant.markedMethod = method;
  participant.attendance = {
    marked: true,
    markedAt: now,
    markedMethod: method,
    markedBy,
  };

  await participant.save();
  const mapped = mapRegistrationDoc(participant.toObject());

  return {
    success: true,
    message: `Attendance marked successfully for ${mapped.fullName}`,
    participant: mapped,
  };
}

export async function toggleAttendance(identifier: string, marked: boolean) {
  const cleanId = identifier.trim();

  const query: any = {
    $or: [
      { studentNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { rollNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { studentNumber: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { barcode: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
    ],
  };

  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    query.$or.push({ _id: new mongoose.Types.ObjectId(cleanId) });
  }

  const participant = await RegistrationModel.findOne(query);
  if (!participant) return null;

  const now = marked ? new Date() : null;
  participant.isPresent = marked;
  participant.present = marked;
  participant.lastMarkedAt = now;
  participant.markedMethod = marked ? 'MANUAL' : null;
  participant.attendance = {
    marked,
    markedAt: now,
    markedMethod: marked ? 'MANUAL' : null,
    markedBy: marked ? 'admin' : null,
  };

  await participant.save();
  return mapRegistrationDoc(participant.toObject());
}

export async function deleteParticipant(identifier: string) {
  const cleanId = identifier.trim();

  const query: any = {
    $or: [
      { studentNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { rollNo: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { studentNumber: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { barcode: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
    ],
  };

  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    query.$or.push({ _id: new mongoose.Types.ObjectId(cleanId) });
  }

  const deleted = await RegistrationModel.findOneAndDelete(query).lean();
  return deleted ? mapRegistrationDoc(deleted) : null;
}

export async function addParticipant(data: any) {
  const studentNo = data.studentNumber || data.studentNo || data.rollNo;
  const isHostel = data.residency === 'Hosteler' || data.hosteller === true;

  const created = await RegistrationModel.create({
    name: data.fullName || data.name,
    fullName: data.fullName || data.name,
    studentNo,
    rollNo: data.rollNo || studentNo,
    studentNumber: studentNo,
    email: data.email,
    phone: data.phoneNumber || data.phone || '',
    phoneNumber: data.phoneNumber || data.phone || '',
    branch: data.branch || 'CSE',
    year: getYearFromStudent(data),
    gender: data.gender || 'Male',
    hosteller: isHostel,
    residency: isHostel ? 'Hosteler' : 'Day Scholar',
    isPresent: false,
    lastMarkedAt: null,
    attendance: {
      marked: false,
      markedAt: null,
      markedMethod: null,
      markedBy: null,
    },
  });

  return mapRegistrationDoc(created.toObject());
}

export async function getMetricsData() {
  const rawDocs = await RegistrationModel.find().lean();
  const participants = rawDocs.map(mapRegistrationDoc);

  const totalRegistrations = participants.length;
  const totalPresent = participants.filter((p) => p.attendance.marked).length;
  const totalAbsent = totalRegistrations - totalPresent;
  const attendanceRate = totalRegistrations > 0 ? ((totalPresent / totalRegistrations) * 100).toFixed(1) : '0';

  // Gender Distribution
  const genderMap: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
  participants.forEach((p) => {
    const g = p.gender || 'Male';
    genderMap[g] = (genderMap[g] || 0) + 1;
  });
  const genderDistribution = Object.keys(genderMap).map((name) => ({
    name,
    count: genderMap[name],
    percentage: totalRegistrations > 0 ? Number(((genderMap[name] / totalRegistrations) * 100).toFixed(1)) : 0,
  }));

  // Residency Distribution
  const residencyMap: Record<string, number> = { Hosteler: 0, 'Day Scholar': 0 };
  participants.forEach((p) => {
    const r = p.residency || 'Day Scholar';
    residencyMap[r] = (residencyMap[r] || 0) + 1;
  });
  const residencyDistribution = Object.keys(residencyMap).map((name) => ({
    name,
    count: residencyMap[name],
    percentage: totalRegistrations > 0 ? Number(((residencyMap[name] / totalRegistrations) * 100).toFixed(1)) : 0,
  }));

  // Branch Distribution
  const branchMap: Record<string, { total: number; present: number }> = {};
  participants.forEach((p) => {
    const b = p.branch || 'Other';
    if (!branchMap[b]) branchMap[b] = { total: 0, present: 0 };
    branchMap[b].total += 1;
    if (p.attendance.marked) branchMap[b].present += 1;
  });
  const branchDistribution = Object.keys(branchMap)
    .map((name) => ({
      name,
      total: branchMap[name].total,
      present: branchMap[name].present,
      percentage: totalRegistrations > 0 ? Number(((branchMap[name].total / totalRegistrations) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Year Distribution
  const yearMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  participants.forEach((p) => {
    if (p.year !== null && p.year !== undefined) {
      const y = Number(p.year);
      if (yearMap[y] !== undefined) {
        yearMap[y] = (yearMap[y] || 0) + 1;
      }
    }
  });
  const yearDistribution = [1, 2, 3, 4].map((year) => ({
    name: `Year ${year}`,
    year,
    count: yearMap[year] || 0,
    percentage: totalRegistrations > 0 ? Number((((yearMap[year] || 0) / totalRegistrations) * 100).toFixed(1)) : 0,
  }));

  // Attendance by Method
  const methodMap: Record<string, number> = { BARCODE: 0, MANUAL: 0 };
  participants.forEach((p) => {
    if (p.attendance.marked && p.attendance.markedMethod) {
      methodMap[p.attendance.markedMethod] = (methodMap[p.attendance.markedMethod] || 0) + 1;
    }
  });

  // Recent 10 check-ins
  const recentCheckIns = participants
    .filter((p) => p.attendance.marked && p.attendance.markedAt)
    .sort((a, b) => new Date(b.attendance.markedAt!).getTime() - new Date(a.attendance.markedAt!).getTime())
    .slice(0, 10);

  // Time-wise registrations on 27 and 28 of October (peak registration days)
  // and short clean summary for other days
  const peakTimeMap: Record<string, { date: string; day: string; time: string; timestamp: number; count: number }> = {};
  const otherDaysMap: Record<string, { date: string; label: string; count: number }> = {};
  let otherDaysTotal = 0;
  let peakDaysTotal = 0;

  participants.forEach((p) => {
    if (!p.registeredAt) return;
    const d = new Date(p.registeredAt);
    if (isNaN(d.getTime())) return;

    // Determine calendar date in IST
    const istDateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // e.g. "2026-10-27"
    const isOct27 = istDateStr.endsWith('-10-27') || p.registeredAt.includes('-10-27');
    const isOct28 = istDateStr.endsWith('-10-28') || p.registeredAt.includes('-10-28');

    if (isOct27 || isOct28) {
      peakDaysTotal += 1;
      const dayLabel = isOct27 ? 'Oct 27' : 'Oct 28';

      // 1-hour time slots formatted in IST
      const hourNum = Number(d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }));
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const slotHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
      const slotTime = `${slotHour}:00 ${period}`;

      const key = `${dayLabel} ${String(hourNum).padStart(2, '0')}:00`;
      const displayLabel = `${dayLabel}, ${slotTime}`;
      const sortTimestamp = (isOct27 ? 1 : 2) * 100 + hourNum;

      if (!peakTimeMap[key]) {
        peakTimeMap[key] = {
          date: displayLabel,
          day: dayLabel,
          time: slotTime,
          timestamp: sortTimestamp,
          count: 0,
        };
      }
      peakTimeMap[key].count += 1;
    } else {
      otherDaysTotal += 1;
      const label = d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: 'numeric',
      });
      if (!otherDaysMap[istDateStr]) {
        otherDaysMap[istDateStr] = {
          date: istDateStr,
          label,
          count: 0,
        };
      }
      otherDaysMap[istDateStr].count += 1;
    }
  });

  // Sort peak days chronologically by day and hour
  const peakTimeline = Object.values(peakTimeMap)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item) => ({
      date: item.date,
      time: item.time,
      day: item.day,
      count: item.count,
    }));

  // Calculate running cumulative counts for peak period
  let runningPeak = 0;
  const timelineWithCumulative = peakTimeline.map((item) => {
    runningPeak += item.count;
    return {
      ...item,
      cumulative: runningPeak,
    };
  });

  // Sort other days chronologically
  const otherDaysSummary = Object.values(otherDaysMap)
    .sort((a, b) => a.date.localeCompare(b.date));

  // If no Oct 27 & 28 registrations exist (e.g. before event or test database),
  // fallback to daily timeline so chart is never blank
  let finalTimeline = timelineWithCumulative;
  if (finalTimeline.length === 0) {
    const generalMap: Record<string, number> = {};
    participants.forEach((p) => {
      if (p.registeredAt) {
        const dStr = new Date(p.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        generalMap[dStr] = (generalMap[dStr] || 0) + 1;
      }
    });
    let runningGen = 0;
    finalTimeline = Object.keys(generalMap).sort().map((d) => {
      runningGen += generalMap[d];
      return {
        date: d,
        count: generalMap[d],
        day: d,
        time: 'All Day',
        cumulative: runningGen,
      };
    });
  }

  return {
    overview: {
      totalRegistrations,
      totalPresent,
      totalAbsent,
      attendanceRate: Number(attendanceRate),
      barcodeScans: methodMap.BARCODE || 0,
      manualCheckIns: methodMap.MANUAL || 0,
    },
    genderDistribution,
    residencyDistribution,
    branchDistribution,
    yearDistribution,
    recentCheckIns,
    timeline: finalTimeline,
    otherDaysSummary,
    otherDaysTotal,
    peakDaysTotal,
  };
}
