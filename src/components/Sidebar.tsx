import React from 'react';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  attendanceStats?: { total: number; present: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onToggle,
  isMobile,
  attendanceStats,
}) => {
  const { logout, user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Metrics',
      badgeColor: '#e0e7ff',
      badgeTextColor: '#3730a3',
    },
    {
      id: 'participants',
      label: 'Participants',
      icon: Users,
      badge: attendanceStats ? `${attendanceStats.total}` : undefined,
      badgeColor: '#e0f2fe',
      badgeTextColor: '#0369a1',
    },
    {
      id: 'attendance',
      label: 'Attendance Scanner',
      icon: ScanLine,
      badge: 'Live',
      badgeColor: '#d1fae5',
      badgeTextColor: '#065f46',
      isHighlight: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          width: isOpen ? '270px' : '80px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '1px 0 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '22px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} color="#ffffff" />
            </div>

            {isOpen && (
              <div style={{ overflow: 'hidden' }}>
                <h1
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  BRL Admin Panel
                </h1>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                  Registration & Attendance
                </p>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              onClick={onToggle}
              title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#64748b',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.background = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobile) onToggle();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: isOpen ? '11px 14px' : '11px',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  background: isActive ? '#eef2ff' : 'transparent',
                  border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                  borderRadius: '10px',
                  color: isActive ? '#4338ca' : '#475569',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#4f46e5' : item.isHighlight ? '#059669' : '#64748b',
                  }}
                >
                  <Icon size={19} />
                </div>

                {isOpen && (
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{item.label}</span>
                )}

                {isOpen && item.badge && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: item.badgeColor,
                      color: item.badgeTextColor,
                      fontWeight: '700',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Attendance Mini Card */}
        {isOpen && attendanceStats && (
          <div
            style={{
              margin: '0 14px 16px',
              padding: '14px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#065f46' }}>Live Check-ins</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#065f46' }}>
                {attendanceStats.present}{' '}
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#047857' }}>
                  / {attendanceStats.total}
                </span>
              </span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#059669' }}>
                {attendanceStats.total > 0
                  ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        )}

        {/* User & Logout Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            gap: '8px',
            background: '#ffffff',
          }}
        >
          {isOpen ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    border: '1px solid #c7d2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4338ca',
                    fontWeight: '700',
                    fontSize: '13px',
                    flexShrink: 0,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      margin: 0,
                    }}
                  >
                    {user?.username || 'Admin'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Administrator</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                  padding: '7px',
                  color: '#e11d48',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
