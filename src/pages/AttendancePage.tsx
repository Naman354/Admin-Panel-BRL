import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Participant, AttendanceResult, formatYear, getParticipantYear } from '../types';
import { api } from '../services/api';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { playSuccessChime, playWarningBuzzer } from '../services/audioEffects';

export const AttendancePage: React.FC = () => {
  const [manualInput, setManualInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<AttendanceResult | null>(null);
  const [recentScans, setRecentScans] = useState<Participant[]>([]);
  const [stats, setStats] = useState<{ total: number; present: number }>({ total: 0, present: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCurrentStats = async () => {
    try {
      const participants = await api.getParticipants();
      const total = participants.length;
      const present = participants.filter((p) => p.attendance?.marked).length;
      setStats({ total, present });

      const sorted = participants
        .filter((p) => p.attendance?.marked && p.attendance.markedAt)
        .sort((a, b) => new Date(b.attendance.markedAt!).getTime() - new Date(a.attendance.markedAt!).getTime())
        .slice(0, 8);
      setRecentScans(sorted);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchCurrentStats();
  }, []);

  const processAttendance = async (identifier: string, method: 'BARCODE' | 'MANUAL') => {
    const cleanId = identifier.trim();
    if (!cleanId) return;

    try {
      setIsSubmitting(true);
      const res = await api.markAttendance(cleanId, method);
      setLastResult(res);

      if (res.success && res.participant) {
        if (soundEnabled) playSuccessChime();
        setStats((prev) => ({ ...prev, present: prev.present + 1 }));
        setRecentScans((prev) => [res.participant!, ...prev.filter((p) => p.studentNumber !== res.participant!.studentNumber)].slice(0, 8));
      } else {
        if (soundEnabled) playWarningBuzzer();
      }
    } catch (err: any) {
      if (soundEnabled) playWarningBuzzer();
      setLastResult({
        success: false,
        error: 'NETWORK_ERROR',
        message: err?.message || 'Unable to complete check-in. Please check your connection.',
      });
    } finally {
      setIsSubmitting(false);
      setManualInput('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processAttendance(manualInput, 'MANUAL');
    }
  };

  const handleBarcodeScan = (scannedCode: string) => {
    processAttendance(scannedCode, 'BARCODE');
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Live Event Attendance Status Bar */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1px solid #a7f3d0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #059669, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
            }}
          >
            <ScanLine size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Live Check-in Desk
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#065f46',
                  background: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid #a7f3d0',
                }}
              >
                ● Ready for Students
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0 0' }}>
              Scan confirmation barcodes from students' phones or look them up by student number.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 12px' }}
            title={soundEnabled ? 'Chime sound is enabled for check-ins' : 'Sound is muted'}
          >
            {soundEnabled ? <Volume2 size={16} color="#059669" /> : <VolumeX size={16} color="#94a3b8" />}
            <span>{soundEnabled ? 'Sound On' : 'Sound Muted'}</span>
          </button>

          {/* Attendance Stats Pill */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 16px',
              textAlign: 'right',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
              Turnout Today
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>{stats.present}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>/ {stats.total} checked in</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>
                ({stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Scanner + Manual Form) & Right (Result Display + Live Stream) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
        {/* Left Column: Input Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Method 1: Barcode Camera Scanner */}
          <BarcodeScanner onScan={handleBarcodeScan} />

          {/* Method 2: Manual Student Number Entry */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                }}
              >
                <Keyboard size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Manual Roll Number Entry
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '1px 0 0' }}>
                  If a student doesn't have their email barcode ready, enter their Student No or Roll No
                </p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  ref={manualInputRef}
                  type="text"
                  className="input-control"
                  placeholder="e.g. 2510074 or 2410082..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '15px',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !manualInput.trim()}
                className="btn btn-primary"
                style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                <CheckCircle2 size={16} />
                <span>Mark Present</span>
              </button>
            </form>

            {/* Quick Live Registered IDs */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: '700' }}>
                💡 Click any registered student to test check-in:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['2510074', '2413096', '2413031', '2410082'].map((roll) => (
                  <button
                    key={roll}
                    type="button"
                    onClick={() => processAttendance(roll, 'MANUAL')}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#e0e7ff',
                      border: '1px solid #c7d2fe',
                      color: '#3730a3',
                      cursor: 'pointer',
                      fontWeight: '700',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#c7d2fe')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#e0e7ff')}
                  >
                    {roll}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Verification Result & Live Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dynamic Verification Result Banner */}
          {lastResult ? (
            lastResult.success && lastResult.participant ? (
              /* Case 1: SUCCESS Check-in */
              <div
                className="glass-card"
                style={{
                  padding: '28px',
                  background: '#ecfdf5',
                  border: '2px solid #10b981',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)',
                  borderRadius: '18px',
                  animation: 'pulseGlow 1.5s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#065f46',
                      }}
                    >
                      Check-in Confirmed
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0' }}>
                      Welcome, {lastResult.participant.fullName}! 🎉
                    </h3>
                  </div>
                </div>

                {/* Participant Details Box */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #a7f3d0',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Student Number</span>
                      <p
                        style={{
                          fontSize: '15px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          color: '#0284c7',
                          margin: '2px 0 0',
                        }}
                      >
                        {lastResult.participant.studentNumber}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Branch & Year</span>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '2px 0 0' }}>
                        {lastResult.participant.branch} ({formatYear(getParticipantYear(lastResult.participant))})
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Living Status</span>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#334155', margin: '2px 0 0' }}>
                        {lastResult.participant.residency}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Verified Via</span>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: '#059669', margin: '2px 0 0' }}>
                        {lastResult.participant.attendance.markedMethod === 'BARCODE' ? 'Barcode Scan' : 'Manual Entry'}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#065f46', fontWeight: '700' }}>
                    Recorded at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <button
                    onClick={() => setLastResult(null)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Next Student
                  </button>
                </div>
              </div>
            ) : lastResult.error === 'ALREADY_MARKED' ? (
              /* Case 2: DUPLICATE CHECK-IN REJECTED */
              <div
                className="glass-card"
                style={{
                  padding: '28px',
                  background: '#fffbeb',
                  border: '2px solid #f59e0b',
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.2)',
                  borderRadius: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#b45309',
                      }}
                    >
                      Already Checked In
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#92400e', margin: '2px 0 0' }}>
                      Duplicate Check-in Rejected
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #fde68a',
                    marginBottom: '16px',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#92400e', fontWeight: '700', marginBottom: '6px' }}>
                    {lastResult.message}
                  </p>
                  <p style={{ fontSize: '12px', color: '#78350f', margin: 0 }}>
                    Each attendee can only be checked in once to prevent duplicate entries.
                  </p>
                  {lastResult.participant?.attendance?.markedAt && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #fef3c7' }}>
                      <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '600' }}>First Check-in Time:</span>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0' }}>
                        {new Date(lastResult.participant.attendance.markedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        via {lastResult.participant.attendance.markedMethod === 'BARCODE' ? 'Barcode' : 'Manual entry'}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setLastResult(null)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            ) : (
              /* Case 3: NOT FOUND */
              <div
                className="glass-card"
                style={{
                  padding: '28px',
                  background: '#fef2f2',
                  border: '2px solid #ef4444',
                  boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.2)',
                  borderRadius: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                      flexShrink: 0,
                    }}
                  >
                    <XCircle size={32} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#b91c1c',
                      }}
                    >
                      No Match Found
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#991b1b', margin: '2px 0 0' }}>
                      Student Not Registered
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '16px', fontWeight: '500' }}>
                  We couldn't find a registration for this barcode or student number. Please verify the roll number or student ID.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setLastResult(null)}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Ready / Idle state */
            <div
              className="glass-card"
              style={{
                padding: '36px 28px',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  margin: '0 auto 16px',
                }}
              >
                <ScanLine size={30} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                Ready to Check In Students
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '340px', margin: '0 auto 16px' }}>
                Scan a student's confirmation barcode using the camera, plug in a scanner gun, or look them up by student number.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#334155',
                  fontWeight: '600',
                }}
              >
                <Sparkles size={14} color="#4f46e5" />
                <span>Single check-in protection is active</span>
              </div>
            </div>
          )}

          {/* Live Recent Check-ins Stream */}
          <div className="glass-card" style={{ padding: '24px', flex: 1, background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Today's Arrivals
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Students checked in during this session</p>
              </div>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: '800' }}>
                {stats.present} Checked In
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {recentScans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  <Clock size={28} style={{ marginBottom: '6px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px', margin: 0 }}>Waiting for first attendee to arrive...</p>
                </div>
              ) : (
                recentScans.map((p) => (
                  <div
                    key={p.studentNumber}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#d1fae5',
                          color: '#065f46',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '12px',
                        }}
                      >
                        {p.fullName.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                          {p.fullName}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: '700' }}>
                            {p.studentNumber}
                          </span>{' '}
                          • {p.branch}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#d1fae5',
                          color: '#065f46',
                          fontWeight: '700',
                        }}
                      >
                        {p.attendance.markedMethod === 'BARCODE' ? 'Barcode' : 'Manual'}
                      </span>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                        {p.attendance.markedAt
                          ? new Date(p.attendance.markedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
