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
  isPresent?: boolean;
  lastMarkedAt?: Date | null;
  markedMethod?: 'BARCODE' | 'MANUAL' | null;
  attendance?: {
    marked: boolean;
    markedAt: Date | null;
    markedMethod: 'BARCODE' | 'MANUAL' | null;
    markedBy: string | null;
  };
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
    isPresent: { type: Boolean, default: false },
    lastMarkedAt: { type: Date, default: null },
    markedMethod: { type: String, enum: ['BARCODE', 'MANUAL', null], default: null },
    attendance: {
      marked: { type: Boolean, default: false },
      markedAt: { type: Date, default: null },
      markedMethod: { type: String, enum: ['BARCODE', 'MANUAL', null], default: null },
      markedBy: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    strict: false, // allow flexible fields from external registrations portal
    collection: 'registrations', // target the actual registrations collection
  }
);

export const RegistrationModel = mongoose.model<IRegistration>('Registration', RegistrationSchema);
