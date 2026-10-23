import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface YearItem {
  name: string;
  year: number;
  count: number;
  percentage: number;
}

interface YearChartProps {
  data: YearItem[];
}

const YEAR_COLORS = ['#0284c7', '#4f46e5', '#7c3aed', '#db2777'];

export const YearChart: React.FC<YearChartProps> = ({ data }) => {
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
          <p style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{item.name}</p>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Registrations: <strong style={{ color: '#0f172a' }}>{item.count}</strong> ({item.percentage}%)
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
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Year-wise Distribution</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Students by current academic year</p>
        </div>
      </div>

      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
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
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={38}>
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={YEAR_COLORS[idx % YEAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Year breakdown cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: 'auto', paddingTop: '12px' }}>
        {data.map((item, idx) => (
          <div
            key={item.name}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '600' }}>Y{item.year}</p>
            <p style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '2px 0 0' }}>
              {item.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
