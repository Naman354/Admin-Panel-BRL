import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Participant, formatYear, getParticipantYear } from '../types';
import { api } from '../services/api';
import { exportParticipantsToExcel } from '../services/excelExport';
import { ParticipantModal } from '../components/ParticipantModal';

export const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedResidency, setSelectedResidency] = useState('All');
  const [selectedAttendance, setSelectedAttendance] = useState('All');

  // Modals state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      const data = await api.getParticipants();
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  // Filtered and searched participants
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          p.fullName.toLowerCase().includes(term) ||
          p.studentNumber.toLowerCase().includes(term) ||
          (p.rollNo && p.rollNo.toLowerCase().includes(term)) ||
          p.email.toLowerCase().includes(term) ||
          (p.phoneNumber && p.phoneNumber.toLowerCase().includes(term)) ||
          p.barcode.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Branch
      if (selectedBranch !== 'All' && p.branch !== selectedBranch) return false;

      // Year
      if (selectedYear !== 'All') {
        const participantYear = getParticipantYear(p);
        if (selectedYear === 'null') {
          if (participantYear !== null && participantYear !== undefined) {
            return false;
          }
        } else if (participantYear !== Number(selectedYear) && String(participantYear) !== selectedYear) {
          return false;
        }
      }

      // Gender
      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;

      // Residency
      if (selectedResidency !== 'All' && p.residency !== selectedResidency) return false;

      // Attendance
      if (selectedAttendance !== 'All') {
        const isPresent = selectedAttendance === 'Present';
        if (p.attendance.marked !== isPresent) return false;
      }

      return true;
    });
  }, [
    participants,
    searchTerm,
    selectedBranch,
    selectedYear,
    selectedGender,
    selectedResidency,
    selectedAttendance,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedBranch,
    selectedYear,
    selectedGender,
    selectedResidency,
    selectedAttendance,
  ]);

  const totalPages = Math.ceil(filteredParticipants.length / pageSize) || 1;
  const paginatedParticipants = filteredParticipants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPresentCount = filteredParticipants.filter((p) => p.attendance?.marked).length;
  const totalAbsentCount = filteredParticipants.length - totalPresentCount;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedBranch('All');
    setSelectedYear('All');
    setSelectedGender('All');
    setSelectedResidency('All');
    setSelectedAttendance('All');
  };

  const handleExport = () => {
    exportParticipantsToExcel(
      filteredParticipants,
      `BRL_Attendees_${selectedAttendance !== 'All' ? selectedAttendance : 'All'}`
    );
  };

  const handleToggleAttendance = async (studentNumber: string, currentStatus: boolean) => {
    try {
      const updated = await api.toggleAttendance(studentNumber, !currentStatus);
      setParticipants((prev) =>
        prev.map((p) => (p.studentNumber === studentNumber ? { ...p, attendance: updated.attendance } : p))
      );
      if (selectedParticipant && selectedParticipant.studentNumber === studentNumber) {
        setSelectedParticipant((prev) => (prev ? { ...prev, attendance: updated.attendance } : null));
      }
    } catch (err) {
      console.error('Failed to toggle attendance:', err);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: '#ffffff',
        }}
      >
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Registered Attendees
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Showing <strong>{filteredParticipants.length}</strong> of {participants.length} students &nbsp;·&nbsp;{' '}
            <span style={{ color: '#059669', fontWeight: '700' }}>{totalPresentCount} Checked In</span>,{' '}
            <span style={{ color: '#d97706', fontWeight: '600' }}>{totalAbsentCount} Awaiting Arrival</span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={fetchParticipants} className="btn btn-secondary" title="Refresh student records">
            <RefreshCw size={15} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          <button onClick={handleExport} className="btn btn-primary">
            <FileSpreadsheet size={16} />
            <span>Download Excel ({filteredParticipants.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: '#ffffff',
        }}
      >
        {/* Search Input Row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-control"
              placeholder="Search by student name, roll number, student ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Clear
              </button>
            )}
          </div>

          {(searchTerm ||
            selectedBranch !== 'All' ||
            selectedYear !== 'All' ||
            selectedGender !== 'All' ||
            selectedResidency !== 'All' ||
            selectedAttendance !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '10px 14px' }}
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
          }}
        >
          {/* Branch Filter */}
          <div className="input-group">
            <label className="input-label">Branch</label>
            <select
              className="input-control"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="CSIT">CSIT</option>
              <option value="CSE(AIML)">CSE (AI/ML)</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          {/* Academic Year */}
          <div className="input-group">
            <label className="input-label">Academic Year</label>
            <select
              className="input-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="null">Unspecified / Null</option>
            </select>
          </div>

          {/* Gender */}
          <div className="input-group">
            <label className="input-label">Gender</label>
            <select
              className="input-control"
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Living Status */}
          <div className="input-group">
            <label className="input-label">Living Status</label>
            <select
              className="input-control"
              value={selectedResidency}
              onChange={(e) => setSelectedResidency(e.target.value)}
            >
              <option value="All">Hostel & Day Scholars</option>
              <option value="Hosteler">Hostel Residents</option>
              <option value="Day Scholar">Day Scholars (Commuters)</option>
            </select>
          </div>

          {/* Attendance Status */}
          <div className="input-group">
            <label className="input-label">Check-in Status</label>
            <select
              className="input-control"
              value={selectedAttendance}
              onChange={(e) => setSelectedAttendance(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Checked In</option>
              <option value="Absent">Not Yet Arrived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', background: '#ffffff' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID & Roll No</th>
                <th>Student</th>
                <th>Branch & Year</th>
                <th>Living Status</th>
                <th>Check-in Status</th>
                <th>Arrival Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#4f46e5',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px',
                      }}
                    />
                    <p style={{ color: '#64748b', fontSize: '13px' }}>Loading attendee list...</p>
                  </td>
                </tr>
              ) : paginatedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                      No students match your search
                    </p>
                    <p style={{ fontSize: '13px' }}>Try searching by another keyword or clear the filters</p>
                    <button
                      onClick={handleResetFilters}
                      className="btn btn-secondary"
                      style={{ marginTop: '16px', fontSize: '12px' }}
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedParticipants.map((p) => {
                  const isPresent = p.attendance?.marked;

                  return (
                    <tr key={p.studentNumber || p._id}>
                      {/* Student Number & Roll Number */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px',
                              fontWeight: '700',
                              color: '#0369a1',
                              background: '#e0f2fe',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: '1px solid #bae6fd',
                              display: 'inline-block',
                              width: 'fit-content',
                            }}
                          >
                            {p.studentNumber}
                          </span>
                          {p.rollNo && p.rollNo !== p.studentNumber && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                              Roll: {p.rollNo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Participant Name & Contact */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: '#e0e7ff',
                              color: '#4338ca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '14px',
                              flexShrink: 0,
                            }}
                          >
                            {p.fullName.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', color: '#0f172a', margin: 0, fontSize: '14px' }}>
                              {p.fullName}
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Year */}
                      <td>
                        <p style={{ fontWeight: '700', color: '#1e293b', margin: 0, fontSize: '13px' }}>
                          {p.branch}
                        </p>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {formatYear(getParticipantYear(p))}
                        </span>
                      </td>

                      {/* Living Status */}
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            className="badge"
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              fontSize: '11px',
                            }}
                          >
                            {p.gender}
                          </span>
                          <span
                            className={`badge ${
                              p.residency === 'Hosteler' ? 'badge-hosteler' : 'badge-dayscholar'
                            }`}
                            style={{ fontSize: '11px' }}
                          >
                            {p.residency}
                          </span>
                        </div>
                      </td>

                      {/* Attendance Status */}
                      <td>
                        <span className={`badge ${isPresent ? 'badge-present' : 'badge-absent'}`}>
                          {isPresent ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          <span>{isPresent ? 'Checked In' : 'Not Checked In'}</span>
                        </span>
                      </td>

                      {/* Arrival Details */}
                      <td>
                        {isPresent && p.attendance.markedAt ? (
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                              {new Date(p.attendance.markedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '1px 0 0' }}>
                              {p.attendance.markedMethod === 'BARCODE' ? 'via Barcode' : 'via Manual'}
                            </p>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Awaiting</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedParticipant(p)}
                            title="View student ticket and details"
                            className="btn btn-secondary btn-icon"
                            style={{ padding: '7px' }}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleToggleAttendance(p.studentNumber, isPresent)}
                            className={`btn ${isPresent ? 'btn-danger' : 'btn-success'}`}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            {isPresent ? 'Undo' : 'Check In'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="input-control"
              style={{ width: 'auto', padding: '4px 24px 4px 10px', fontSize: '12px' }}
            >
              <option value={10}>10 students</option>
              <option value={25}>25 students</option>
              <option value={50}>50 students</option>
              <option value={100}>100 students</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-icon"
                style={{ padding: '6px', opacity: currentPage === 1 ? 0.4 : 1 }}
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="btn btn-secondary btn-icon"
                style={{ padding: '6px', opacity: currentPage >= totalPages ? 0.4 : 1 }}
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Profile Modal */}
      <ParticipantModal
        participant={selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        onToggleAttendance={handleToggleAttendance}
      />
    </div>
  );
};
