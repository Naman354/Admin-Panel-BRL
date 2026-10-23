import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#4f46e5',
  badge,
  badgeType = 'info',
  trend,
}) => {
  const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
    success: {
      bg: '#d1fae5',
      text: '#065f46',
      border: '#a7f3d0',
    },
    warning: {
      bg: '#fef3c7',
      text: '#92400e',
      border: '#fde68a',
    },
    info: {
      bg: '#e0e7ff',
      text: '#3730a3',
      border: '#c7d2fe',
    },
    danger: {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#fecdd3',
    },
  };

  const style = badgeStyles[badgeType] || badgeStyles.info;

  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
          {title}
        </span>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </h3>
        {badge && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '999px',
              background: style.bg,
              color: style.text,
              border: `1px solid ${style.border}`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {subtitle && <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{subtitle}</p>}
        {trend && (
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginLeft: 'auto' }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
