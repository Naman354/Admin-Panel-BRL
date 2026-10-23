import React from 'react';
import { Home, Compass } from 'lucide-react';

interface ResidencyItem {
  name: string;
  count: number;
  percentage: number;
}

interface ResidencyChartProps {
  data: ResidencyItem[];
}

export const ResidencyChart: React.FC<ResidencyChartProps> = ({ data }) => {
  const hosteler = data.find((d) => d.name === 'Hosteler') || { name: 'Hosteler', count: 0, percentage: 0 };
  const dayScholar = data.find((d) => d.name === 'Day Scholar') || { name: 'Day Scholar', count: 0, percentage: 0 };
  const total = hosteler.count + dayScholar.count;

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Living on Campus vs Commuting</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Hostel residents vs students commuting from home</p>
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            background: '#f1f5f9',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
        >
          {total} students total
        </span>
      </div>

      {/* Visual Dual Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            height: '14px',
            width: '100%',
            background: '#f1f5f9',
            borderRadius: '999px',
            overflow: 'hidden',
            display: 'flex',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: `${hosteler.percentage}%`,
              background: '#4f46e5',
              transition: 'width 0.8s ease',
              borderRadius: '999px 0 0 999px',
            }}
            title={`Hostelers: ${hosteler.count} (${hosteler.percentage}%)`}
          />
          <div
            style={{
              width: `${dayScholar.percentage}%`,
              background: '#0284c7',
              transition: 'width 0.8s ease',
              borderRadius: '0 999px 999px 0',
            }}
            title={`Day Scholars: ${dayScholar.count} (${dayScholar.percentage}%)`}
          />
        </div>
      </div>

      {/* Side-by-side cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: 'auto' }}>
        {/* Hosteler Card */}
        <div
          style={{
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: '14px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6d28d9',
              }}
            >
              <Home size={18} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#5b21b6', margin: 0 }}>Hostelers</p>
              <p style={{ fontSize: '11px', color: '#7c3aed', margin: 0 }}>Living on Campus</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{hosteler.count}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#6d28d9' }}>
              {hosteler.percentage}%
            </span>
          </div>
        </div>

        {/* Day Scholar Card */}
        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '14px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0369a1',
              }}
            >
              <Compass size={18} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1', margin: 0 }}>Day Scholars</p>
              <p style={{ fontSize: '11px', color: '#0284c7', margin: 0 }}>Commuting from Home</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{dayScholar.count}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7' }}>
              {dayScholar.percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
