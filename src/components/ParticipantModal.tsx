import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Home,
  CheckCircle2,
  Shirt,
} from 'lucide-react';
import { Participant, formatYear, getParticipantYear } from '../types';

interface ParticipantModalProps {
  participant: Participant | null;
  onClose: () => void;
  onToggleAttendance: (identifier: string, currentStatus: boolean) => void;
}

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  participant,
  onClose,
  onToggleAttendance,
}) => {
  if (!participant) return null;

  const isPresent = participant.attendance?.marked;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#0f172a';
            e.currentTarget.style.background = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.background = '#f1f5f9';
          }}
        >
          <X size={18} />
        </button>

        {/* Header with Avatar & Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '800',
              flexShrink: 0,
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.25)',
            }}
          >
            {participant.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {participant.fullName}
              </h3>
              <span
                className={`badge ${isPresent ? 'badge-present' : 'badge-absent'}`}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                {isPresent ? 'Checked In' : 'Not Checked In'}
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: '#4f46e5',
                fontWeight: '700',
                margin: '4px 0 0',
              }}
            >
              Roll: {participant.rollNo || participant.studentNumber} • Student No: {participant.studentNumber}
            </p>
          </div>
        </div>

        {/* Barcode Preview Card */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center',
            color: '#0f172a',
            border: '2px dashed #cbd5e1',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Confirmation Barcode / Student ID
          </p>
          <div
            style={{
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '8px 0 4px',
              letterSpacing: '5px',
              fontFamily: 'monospace',
              fontSize: '28px',
              fontWeight: '900',
              background: 'repeating-linear-gradient(90deg, #0f172a 0, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 7px, transparent 7px, transparent 9px)',
              width: '80%',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: '700',
              color: '#0f172a',
              letterSpacing: '0.05em',
            }}
          >
            {participant.barcode || participant.studentNumber}
          </span>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
              <Mail size={13} /> Email Address
            </span>
            <p style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginTop: '3px', wordBreak: 'break-all' }}>
              {participant.email}
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
              <Phone size={13} /> Phone Number
            </span>
            <p style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginTop: '3px' }}>
              {participant.phoneNumber || 'Not provided'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
              <GraduationCap size={13} /> Academic Branch & Year
            </span>
            <p style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginTop: '3px' }}>
              {participant.branch} ({formatYear(getParticipantYear(participant))})
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
              <Home size={13} /> Living Status
            </span>
            <p style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginTop: '3px' }}>
              {participant.residency === 'Hosteler' ? 'Hostel Resident' : 'Day Scholar (Commuter)'}
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
              <User size={13} /> Gender
            </span>
            <p style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginTop: '3px' }}>
              {participant.gender}
            </p>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
              <Shirt size={13} /> T-Shirt Size
            </span>
            <p style={{ fontSize: '13px', color: '#0f172a', fontWeight: '600', marginTop: '3px' }}>
              {participant.tShirtSize || 'M'}
            </p>
          </div>
        </div>

        {/* Check-in timestamp log */}
        {isPresent && participant.attendance.markedAt && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#065f46', margin: 0 }}>
                  Checked In Successfully
                </p>
                <p style={{ fontSize: '11px', color: '#047857', margin: 0 }}>
                  Verified via {participant.attendance.markedMethod === 'BARCODE' ? 'Barcode Scan' : 'Manual Entry'}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#065f46', margin: 0 }}>
                {new Date(participant.attendance.markedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
              <p style={{ fontSize: '10px', color: '#047857', margin: 0 }}>
                {new Date(participant.attendance.markedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onToggleAttendance(participant.studentNumber, isPresent)}
            className={`btn ${isPresent ? 'btn-danger' : 'btn-success'}`}
            style={{ flex: 1, padding: '12px' }}
          >
            <CheckCircle2 size={18} />
            <span>{isPresent ? 'Undo Check-in' : 'Mark as Checked In'}</span>
          </button>

          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '12px 20px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
