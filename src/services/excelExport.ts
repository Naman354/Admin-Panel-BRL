import * as XLSX from 'xlsx';
import { Participant, formatYear, getParticipantYear, isParticipantPresent } from '../types';

export function exportParticipantsToExcel(
  participants: Participant[],
  fileName = 'BRL_Registration_Participants'
) {
  // Format data for Excel worksheet
  const formattedData = participants.map((p, index) => {
    const isPresent = isParticipantPresent(p);
    let attendanceTimeStr = 'N/A';
    if (isPresent && p.attendance?.markedAt) {
      const d = new Date(p.attendance.markedAt);
      if (!isNaN(d.getTime())) {
        attendanceTimeStr = d.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'medium',
        });
      }
    }

    let registeredTimeStr = 'N/A';
    if (p.registeredAt) {
      const d = new Date(p.registeredAt);
      if (!isNaN(d.getTime())) {
        registeredTimeStr = d.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
      }
    }

    return {
      'S.No': index + 1,
      'Student No': p.studentNumber,
      'University Roll No': p.rollNo || p.studentNumber,
      'Full Name': p.fullName,
      'Email Address': p.email,
      'Phone Number': p.phoneNumber || 'N/A',
      'Branch / Department': p.branch,
      'Academic Year': formatYear(getParticipantYear(p)),
      'Gender': p.gender,
      'Residency Type': p.residency,
      'Attendance Status': isPresent ? 'PRESENT' : 'ABSENT',
      'Attendance Timestamp': attendanceTimeStr,
      'Check-in Method': p.attendance?.markedMethod || (isPresent ? 'BARCODE' : 'N/A'),
      'Registration Date': registeredTimeStr,
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 16 }, // Student No
    { wch: 18 }, // University Roll No
    { wch: 22 }, // Full Name
    { wch: 26 }, // Email
    { wch: 16 }, // Phone
    { wch: 22 }, // Branch
    { wch: 14 }, // Year
    { wch: 10 }, // Gender
    { wch: 14 }, // Residency
    { wch: 16 }, // Attendance Status
    { wch: 24 }, // Timestamp
    { wch: 16 }, // Method
    { wch: 20 }, // Registration Date
  ];

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants List');

  // Generate filename with date stamp
  const dateStamp = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileName}_${dateStamp}.xlsx`;

  // Write and trigger browser download
  XLSX.writeFile(workbook, fullFileName);
}
