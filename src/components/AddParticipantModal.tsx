import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { Participant } from '../types';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<Participant>) => Promise<boolean>;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    studentNumber: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    branch: 'CSE',
    year: 1,
    gender: 'Male',
    residency: 'Day Scholar',
    category: 'Student',
    tShirtSize: 'M',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentNumber.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      setError('Please fill in Student/Roll Number, Full Name, and Email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const success = await onAdd({
        ...formData,
        studentNumber: formData.studentNumber.trim().toUpperCase(),
        year: Number(formData.year),
      } as any);

      if (success) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Could not save attendee details. Please check the information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          maxWidth: '520px',
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
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <UserPlus size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Register Walk-in Student
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Add an attendee who arrived at the event without registering online in advance
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Student No / Roll No *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. 2510099"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Email Address *</label>
              <input
                type="email"
                className="input-control"
                placeholder="name@akgec.ac.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="text"
                className="input-control"
                placeholder="9876543210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Branch *</label>
              <select
                className="input-control"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="CSIT">CSIT</option>
                <option value="CSE(AIML)">CSE (AI/ML)</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Academic Year *</label>
              <select
                className="input-control"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Gender *</label>
              <select
                className="input-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Living Status *</label>
              <select
                className="input-control"
                value={formData.residency}
                onChange={(e) => setFormData({ ...formData, residency: e.target.value })}
              >
                <option value="Hosteler">Hosteler (Living on Campus)</option>
                <option value="Day Scholar">Day Scholar (Commuting from Home)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              <UserPlus size={18} />
              <span>{isSubmitting ? 'Registering...' : 'Save & Check In Student'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '12px 20px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
