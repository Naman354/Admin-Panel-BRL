import React, { useEffect, useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  ScanLine,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { MetricsData } from '../types';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { GenderChart } from '../components/Charts/GenderChart';
import { ResidencyChart } from '../components/Charts/ResidencyChart';
import { BranchChart } from '../components/Charts/BranchChart';
import { YearChart } from '../components/Charts/YearChart';
import { RegistrationTimelineChart } from '../components/Charts/RegistrationTimelineChart';
import { exportParticipantsToExcel } from '../services/excelExport';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load registration metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleExportAll = async () => {
    try {
      const participants = await api.getParticipants();
      exportParticipantsToExcel(participants, 'BRL_Registered_Participants');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#4f46e5',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', margin: '40px auto', maxWidth: '500px', background: '#ffffff' }}>
        <AlertCircle size={40} color="#e11d48" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '18px', color: '#0f172a', fontWeight: '800', marginBottom: '8px' }}>Failed to Load Dashboard</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{error}</p>
        <button onClick={fetchMetrics} className="btn btn-primary">
          Retry Loading
        </button>
      </div>
    );
  }

  const { overview } = metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)',
          border: '1px solid #c7d2fe',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#059669',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BRL Live Registration Station
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em', margin: 0 }}>
            Registration & Attendance Metrics
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0' }}>
            Live monitoring of participant registrations, branches, and on-site attendance from MongoDB.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleExportAll} className="btn btn-secondary" style={{ fontSize: '13px' }}>
            <FileSpreadsheet size={16} color="#059669" />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="btn btn-primary"
            style={{ fontSize: '13px' }}
          >
            <ScanLine size={16} />
            <span>Open Barcode Scanner</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Top Row: 4 Primary KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard
          title="Total Registrations"
          value={overview.totalRegistrations}
          subtitle="All confirmed participants in database"
          icon={Users}
          color="#4f46e5"
          badge="Live DB"
          badgeType="info"
        />

        <MetricCard
          title="Attendance Marked"
          value={overview.totalPresent}
          subtitle={`${overview.attendanceRate}% of registered attendees checked in`}
          icon={CheckCircle2}
          color="#059669"
          badge={`${overview.attendanceRate}%`}
          badgeType="success"
          trend={`${overview.totalPresent} Present`}
        />

        <MetricCard
          title="Pending / Absent"
          value={overview.totalAbsent}
          subtitle="Yet to scan badge at the desk"
          icon={Clock}
          color="#d97706"
          badge={`${(100 - overview.attendanceRate).toFixed(1)}%`}
          badgeType="warning"
        />

        <MetricCard
          title="Check-in Methods"
          value={`${overview.barcodeScans} / ${overview.manualCheckIns}`}
          subtitle="Barcode Scans vs Manual Roll ID"
          icon={ScanLine}
          color="#0284c7"
          badge="Verified"
          badgeType="info"
        />
      </div>

      {/* Row 2: Demographic Charts (Gender & Residency) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        <GenderChart data={metrics.genderDistribution} />
        <ResidencyChart data={metrics.residencyDistribution} />
      </div>

      {/* Row 3: Branch & Academic Year Distributions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        <BranchChart data={metrics.branchDistribution} />
        <YearChart data={metrics.yearDistribution} />
      </div>

      {/* Row 4: Registration Timeline & Recent Check-ins */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        <RegistrationTimelineChart data={metrics.timeline} />

        {/* Live Recent Check-ins Feed */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Live Attendance Feed</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Latest participants verified at the venue desk</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4f46e5',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Scan More</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '250px' }}>
            {metrics.recentCheckIns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px' }}>No check-ins recorded yet today.</p>
              </div>
            ) : (
              metrics.recentCheckIns.map((p) => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: '#d1fae5',
                        color: '#065f46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '13px',
                      }}
                    >
                      {p.fullName.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {p.fullName}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                        <strong style={{ color: '#0369a1' }}>{p.studentNumber}</strong> • {p.branch}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: '#d1fae5',
                        color: '#065f46',
                        fontWeight: '700',
                      }}
                    >
                      {p.attendance.markedMethod || 'VERIFIED'}
                    </span>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
                      {p.attendance.markedAt
                        ? new Date(p.attendance.markedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
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
  );
};
