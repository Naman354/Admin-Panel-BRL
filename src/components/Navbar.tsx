import React from 'react';
import { Menu, ScanLine, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onRefresh?: () => void;
  onExportExcel?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  currentPage,
  onNavigate,
  onRefresh,
  onExportExcel,
  isRefreshing,
}) => {
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Registration Analytics',
      subtitle: 'Real-time participant metrics & demographic distribution',
    },
    participants: {
      title: 'Participants Directory',
      subtitle: 'Complete list of registered attendees with full records',
    },
    attendance: {
      title: 'Day-of-Event Attendance',
      subtitle: 'Fast barcode scanner & manual roll number check-in',
    },
  };

  const current = pageTitles[currentPage] || {
    title: 'BRL Admin Panel',
    subtitle: 'Registration & Attendance Console',
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Left: Hamburger & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            color: '#334155',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em', margin: 0 }}>
              {current.title}
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#059669',
                }}
              />
              BRL Portal
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '8px 12px' }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span style={{ display: 'none' }}>Refresh</span>
          </button>
        )}

        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            <FileSpreadsheet size={16} color="#059669" />
            <span>Export Excel</span>
          </button>
        )}

        {currentPage !== 'attendance' && (
          <button
            onClick={() => onNavigate('attendance')}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            <ScanLine size={16} />
            <span>Open Scanner</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
