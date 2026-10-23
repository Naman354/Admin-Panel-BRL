import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GenderDistributionItem {
  name: string;
  count: number;
  percentage: number;
}

interface GenderChartProps {
  data: GenderDistributionItem[];
}

const GENDER_COLORS: Record<string, string> = {
  Male: '#0284c7', // Sky Blue
  Female: '#db2777', // Rose
  Other: '#7c3aed', // Purple
};

export const GenderChart: React.FC<GenderChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: GENDER_COLORS[item.name] || '#4f46e5',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{item.name}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: '4px 0 0' }}>
            Count: <strong style={{ color: '#0f172a' }}>{item.count} students</strong> ({item.percentage}%)
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
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Attendees by Gender</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Distribution of registered students</p>
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
          {total} Total
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || '#4f46e5'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center summary text */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{total}</span>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '600' }}>Students</p>
        </div>
      </div>

      {/* Legend with cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: 'auto', paddingTop: '16px' }}>
        {data.map((item) => {
          const color = GENDER_COLORS[item.name] || '#4f46e5';
          return (
            <div
              key={item.name}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{item.name}</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {item.count}{' '}
                <span style={{ fontSize: '11px', color: color, fontWeight: '700' }}>({item.percentage}%)</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
