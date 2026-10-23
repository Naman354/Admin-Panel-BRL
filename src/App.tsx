import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { AttendancePage } from './pages/AttendancePage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { api } from './services/api';
import { exportParticipantsToExcel } from './services/excelExport';

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [attendanceStats, setAttendanceStats] = useState<{ total: number; present: number }>({
    total: 0,
    present: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Responsive screen listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch live stats
  const fetchGlobalStats = async () => {
    if (!isAuthenticated) return;
    try {
      setIsRefreshing(true);
      const participantsRes = await api.getParticipants().catch(() => []);

      if (Array.isArray(participantsRes)) {
        const total = participantsRes.length;
        const present = participantsRes.filter((p) => p.attendance?.marked).length;
        setAttendanceStats({ total, present });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGlobalStats();
      const interval = setInterval(fetchGlobalStats, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleGlobalExcelExport = async () => {
    try {
      const participants = await api.getParticipants();
      exportParticipantsToExcel(participants, 'BRL_Registered_Participants');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
        }}
      >
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
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
            Loading BRL Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Hamburger Responsive Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMobile={isMobile}
        attendanceStats={attendanceStats}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onRefresh={fetchGlobalStats}
          onExportExcel={handleGlobalExcelExport}
          isRefreshing={isRefreshing}
        />

        <main className="page-wrapper">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'participants' && <ParticipantsPage />}
          {currentPage === 'attendance' && <AttendancePage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
