import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { TimelineItem, OtherDaySummary } from '../../types';

interface RegistrationTimelineChartProps {
  data: TimelineItem[];
  otherDays?: OtherDaySummary[];
  otherDaysTotal?: number;
  peakDaysTotal?: number;
}

export const RegistrationTimelineChart: React.FC<RegistrationTimelineChartProps> = ({
  data,
  otherDays = [],
  otherDaysTotal = 0,
  peakDaysTotal,
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<'ALL' | 'OCT27' | 'OCT28'>('ALL');

  // Determine if both Oct 27 and Oct 28 exist in the dataset
  const hasOct27 = useMemo(
    () => data.some((d) => (d.day && d.day.includes('27')) || d.date.includes('Oct 27') || d.date.includes('-10-27')),
    [data]
  );
  const hasOct28 = useMemo(
    () => data.some((d) => (d.day && d.day.includes('28')) || d.date.includes('Oct 28') || d.date.includes('-10-28')),
    [data]
  );

  // Filter time-wise items based on user selection
  const filteredData = useMemo(() => {
    if (selectedDayFilter === 'OCT27') {
      return data.filter((d) => (d.day && d.day.includes('27')) || d.date.includes('Oct 27') || d.date.includes('-10-27'));
    }
    if (selectedDayFilter === 'OCT28') {
      return data.filter((d) => (d.day && d.day.includes('28')) || d.date.includes('Oct 28') || d.date.includes('-10-28'));
    }
    return data;
  }, [data, selectedDayFilter]);

  // Find peak hour count for callout badge
  const maxSlot = useMemo(() => {
    if (filteredData.length === 0) return null;
    return filteredData.reduce((max, curr) => (curr.count > max.count ? curr : max), filteredData[0]);
  }, [filteredData]);

  // Total signups in the currently viewed graph slice
  const currentViewTotal = useMemo(() => {
    return filteredData.reduce((sum, d) => sum + d.count, 0);
  }, [filteredData]);

  // Format chart data points
  const chartData = useMemo(() => {
    return filteredData.map((d) => {
      // Create concise X-axis label
      let xLabel = d.date;
      if (d.time) {
        if (selectedDayFilter === 'ALL' && d.day) {
          xLabel = `${d.day} ${d.time}`;
        } else {
          xLabel = d.time;
        }
      }
      return {
        ...d,
        xLabel,
        Registrations: d.count,
        Cumulative: d.cumulative ?? d.count,
      };
    });
  }, [filteredData, selectedDayFilter]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isPeak = maxSlot && item.count === maxSlot.count && maxSlot.count > 0;

      return (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 12px 30px -5px rgba(15, 23, 42, 0.15)',
            minWidth: '180px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              {item.day || 'Peak Window'}
            </span>
            {isPeak && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: '#b45309',
                  background: '#fef3c7',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Sparkles size={10} /> Peak Hour
              </span>
            )}
          </div>

          <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '4px 0 6px' }}>
            {item.date}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#4f46e5' }}>
              +{item.Registrations}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>new registrations</span>
          </div>

          {item.Cumulative !== undefined && (
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
              Surge total so far: <strong style={{ color: '#334155' }}>{item.Cumulative} candidates</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Header with Title and Day Toggles */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Sign-ups Over Time
            </h4>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#4338ca',
                background: '#e0e7ff',
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <TrendingUp size={12} /> Oct 27 & 28 Peak
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
            Time-wise registration velocity during peak sign-up days
          </p>
        </div>

        {/* View Switcher: All / Oct 27 / Oct 28 */}
        {hasOct27 && hasOct28 && (
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              gap: '2px',
            }}
          >
            <button
              onClick={() => setSelectedDayFilter('ALL')}
              style={{
                border: 'none',
                background: selectedDayFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: selectedDayFilter === 'ALL' ? '#0f172a' : '#64748b',
                fontWeight: selectedDayFilter === 'ALL' ? '700' : '500',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedDayFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Both (27 & 28)
            </button>
            <button
              onClick={() => setSelectedDayFilter('OCT27')}
              style={{
                border: 'none',
                background: selectedDayFilter === 'OCT27' ? '#ffffff' : 'transparent',
                color: selectedDayFilter === 'OCT27' ? '#0f172a' : '#64748b',
                fontWeight: selectedDayFilter === 'OCT27' ? '700' : '500',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedDayFilter === 'OCT27' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              27 Oct
            </button>
            <button
              onClick={() => setSelectedDayFilter('OCT28')}
              style={{
                border: 'none',
                background: selectedDayFilter === 'OCT28' ? '#ffffff' : 'transparent',
                color: selectedDayFilter === 'OCT28' ? '#0f172a' : '#64748b',
                fontWeight: selectedDayFilter === 'OCT28' ? '700' : '500',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: selectedDayFilter === 'OCT28' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              28 Oct
            </button>
          </div>
        )}
      </div>

      {/* Main Time-wise Area Chart */}
      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#818cf8" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="xLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="Registrations"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#regGradient)"
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#4f46e5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Surge Summary Pill Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '10px',
          padding: '8px 12px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="#64748b" />
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Current View Total:{' '}
            <strong style={{ color: '#0f172a' }}>{currentViewTotal} candidates</strong>
          </span>
        </div>

        {maxSlot && maxSlot.count > 0 && (
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            Highest Velocity: <strong style={{ color: '#4338ca' }}>+{maxSlot.count} / hr</strong> ({maxSlot.date})
          </span>
        )}
      </div>

      {/* Separately Mentioning Other Days in a Short Clean Format */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={13} color="#64748b" /> Other Days Registration Summary
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            {otherDays.length > 0 ? (
              <>
                Other days total: <strong style={{ color: '#0f172a' }}>{otherDaysTotal}</strong>
              </>
            ) : (
              <span style={{ color: '#10b981', fontWeight: '600' }}>100% captured during peak</span>
            )}
          </span>
        </div>

        {otherDays.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {otherDays.map((d) => (
              <div
                key={d.date}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.15s ease',
                }}
              >
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{d.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#0f172a',
                    background: '#e2e8f0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
            All registrations were received on October 27 and 28. No sign-ups recorded on other days.
          </p>
        )}
      </div>
    </div>
  );
};
