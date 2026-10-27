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

export function getAttendance(doc: any) {
  const isMarked = Boolean(doc.isPresent || doc.attendance?.marked);
  const markedAt = doc.lastMarkedAt || doc.attendance?.markedAt || null;
  const markedMethod = doc.markedMethod || doc.attendance?.markedMethod || (isMarked ? 'BARCODE' : null);
  return {
    marked: isMarked,
    markedAt: markedAt ? new Date(markedAt).toISOString() : null,
    markedMethod: markedMethod as 'BARCODE' | 'MANUAL' | null,
    markedBy: doc.attendance?.markedBy || 'admin',
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

  if (query?.attendance && query.attendance !== 'All') {
    const isPresent = query.attendance === 'Present';
    if (isPresent) {
      filter.$or = [{ isPresent: true }, { 'attendance.marked': true }];
    } else {
      filter.$and = [
        { isPresent: { $ne: true } },
        { 'attendance.marked': { $ne: true } },
      ];
    }
  }

  const rawDocs = await RegistrationModel.find(filter).sort({ createdAt: -1 }).lean();
  let results = rawDocs.map(mapRegistrationDoc);

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

  // STRICT SINGLE CHECK-IN RULE: Check if already marked present
  const isAlreadyMarked = Boolean(participant.isPresent || participant.attendance?.marked);

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

  // Registration Timeline (grouped by day)
  const timelineMap: Record<string, number> = {};
  participants.forEach((p) => {
    if (p.registeredAt) {
      const dateStr = new Date(p.registeredAt).toISOString().split('T')[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    }
  });
  const timeline = Object.keys(timelineMap)
    .sort()
    .map((date) => ({
      date,
      count: timelineMap[date],
    }));

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
    timeline,
  };
}
