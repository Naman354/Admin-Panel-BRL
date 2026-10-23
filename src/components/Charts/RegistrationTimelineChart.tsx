import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TimelineItem {
  date: string;
  count: number;
}

interface RegistrationTimelineChartProps {
  data: TimelineItem[];
}

export const RegistrationTimelineChart: React.FC<RegistrationTimelineChartProps> = ({ data }) => {
  const formattedData = data.map((d) => {
    const dateObj = new Date(d.date);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: label,
      rawDate: d.date,
      Registrations: d.count,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{item.rawDate}</p>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>
            {item.Registrations} students registered
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Sign-ups Over Time</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Daily registrations leading up to the seminar</p>
        </div>
      </div>

      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
