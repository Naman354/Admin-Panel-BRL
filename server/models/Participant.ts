import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  name: string;
  rollNo?: string;
  studentNo?: string;
  studentNumber?: string;
  fullName?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  branch: string;
  year?: number | string | null;
  gender: string;
  hosteller?: boolean;
  residency?: string;
  isPresent?: any;
  present?: any;
  attended?: any;
  checkedIn?: any;
  checkIn?: any;
  status?: string;
  attendanceStatus?: string;
  lastMarkedAt?: Date | null;
  markedAt?: Date | null;
  checkInTime?: Date | null;
  checkedInAt?: Date | null;
  markedMethod?: 'BARCODE' | 'MANUAL' | null | string;
  attendance?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    fullName: { type: String, trim: true },
    rollNo: { type: String, trim: true, index: true },
    studentNo: { type: String, trim: true, index: true },
    studentNumber: { type: String, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    branch: { type: String, required: true },
    year: { type: Schema.Types.Mixed },
    gender: { type: String, default: 'Male' },
    hosteller: { type: Boolean, default: false },
    residency: { type: String },
    isPresent: { type: Schema.Types.Mixed, default: false },
    lastMarkedAt: { type: Schema.Types.Mixed, default: null },
    markedMethod: { type: Schema.Types.Mixed, default: null },
    attendance: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    strict: false, // allow flexible fields from external registrations portal & other attendance sources
    collection: 'registrations', // target the actual registrations collection
  }
);

export const RegistrationModel = mongoose.model<IRegistration>('Registration', RegistrationSchema);

