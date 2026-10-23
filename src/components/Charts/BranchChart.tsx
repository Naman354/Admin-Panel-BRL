import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BranchDistributionItem {
  name: string;
  total: number;
  present: number;
  percentage: number;
}

interface BranchChartProps {
  data: BranchDistributionItem[];
}

export const BranchChart: React.FC<BranchChartProps> = ({ data }) => {
  const chartData = data.map((b) => {
    let shortName = b.name;
    if (b.name === 'Computer Science') shortName = 'CSE';
    if (b.name === 'Information Technology') shortName = 'IT';
    if (b.name === 'AI & Data Science') shortName = 'AI/DS';
    if (b.name === 'Electronics & Comm.') shortName = 'ECE';
    if (b.name === 'Mechanical Engg.') shortName = 'ME';
    if (b.name === 'Electrical Engg.') shortName = 'EE';
    if (b.name === 'Civil Engg.') shortName = 'CE';

    return {
      fullName: b.name,
      shortName,
      Registered: b.total,
      'Checked In': b.present,
      percentage: b.percentage,
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
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            {item.fullName}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Total Registered:{' '}
                <strong style={{ color: '#0f172a' }}>{item.Registered}</strong> ({item.percentage}% of all sign-ups)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Present at Event:{' '}
                <strong style={{ color: '#059669' }}>{item['Checked In']} students</strong>
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Registrations & Turnout by Branch</h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Compare how many signed up vs how many have arrived from each department</p>
        </div>
      </div>

      <div style={{ width: '100%', height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortName"
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
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
              formatter={(value) => <span style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>{value}</span>}
            />
            <Bar dataKey="Registered" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Checked In" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
