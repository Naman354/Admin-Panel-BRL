import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
  initDatabase,
  getConnectionStatus,
  getAllParticipants,
  findParticipant,
  markAttendance,
  toggleAttendance,
  addParticipant,
  getMetricsData,
} from './db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_admin_jwt_token_portal_2026_xyz';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@portal2026';

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Database (MongoDB live connection)
initDatabase();

// ---------------- AUTH MIDDLEWARE ----------------
interface AuthRequest extends Request {
  user?: any;
}

function verifyAdminToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
}

// ---------------- ROUTES ----------------

// 1. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  const isUsernameValid = !username || username.trim() === ADMIN_USERNAME;
  const isPasswordValid = password === ADMIN_PASSWORD;

  if (isUsernameValid && isPasswordValid) {
    const token = jwt.sign(
      {
        username: ADMIN_USERNAME,
        role: 'admin',
        loginTime: new Date().toISOString(),
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'Admin',
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials.',
  });
});

// 2. Auth: Verify current token
app.get('/api/auth/verify', verifyAdminToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, valid: true, user: req.user });
});

// 3. Metrics (for Dashboard)
app.get('/api/metrics', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const metrics = await getMetricsData();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Participants List
app.get('/api/participants', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { search, branch, year, gender, residency, attendance } = req.query;
    const participants = await getAllParticipants({
      search: search as string,
      branch: branch as string,
      year: year as string,
      gender: gender as string,
      residency: residency as string,
      attendance: attendance as string,
    });
    res.json({ success: true, count: participants.length, data: participants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get Participant Details by ID / Barcode
app.get('/api/participants/:identifier', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const participant = await findParticipant(req.params.identifier);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    res.json({ success: true, data: participant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Add New Participant (Walk-in Desk Registration)
app.post('/api/participants', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { studentNumber, studentNo, fullName, name, email, branch, year, gender, residency, phoneNumber, phone } = req.body;

    const idNumber = studentNumber || studentNo;
    const personName = fullName || name;

    if (!idNumber || !personName || !email) {
      return res.status(400).json({ success: false, message: 'Missing required participant fields' });
    }

    const existing = await findParticipant(idNumber);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Student Number already exists' });
    }

    const newParticipant = await addParticipant({
      studentNumber: idNumber,
      studentNo: idNumber,
      fullName: personName,
      name: personName,
      email,
      branch: branch || 'CSE',
      year: Number(year) || 1,
      gender: gender || 'Male',
      residency: residency || 'Day Scholar',
      phoneNumber: phoneNumber || phone || '',
    });

    res.status(201).json({ success: true, data: newParticipant });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Mark Attendance (Day of Event) - Single Check-in Rule
app.post('/api/attendance/mark', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { identifier, method } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_IDENTIFIER',
        message: 'Barcode or Student Number is required',
      });
    }

    const result = await markAttendance(identifier, method || 'BARCODE', 'admin');

    if (!result.success) {
      if (result.error === 'ALREADY_MARKED') {
        return res.status(409).json({
          success: false,
          error: result.error,
          message: result.message,
          participant: result.participant,
        });
      }

      if (result.error === 'PARTICIPANT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: result.error,
          message: result.message,
        });
      }

      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: result.message,
      participant: result.participant,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Toggle Attendance
app.post('/api/attendance/toggle', verifyAdminToken, async (req: Request, res: Response) => {
  try {
    const { identifier, marked } = req.body;
    if (!identifier || typeof marked !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const updated = await toggleAttendance(identifier, marked);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    res.json({ success: true, participant: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. Status Endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const status = getConnectionStatus();
  res.json({
    success: true,
    server: 'Running',
    port: PORT,
    database: status,
    timestamp: new Date().toISOString(),
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚡ BRL Admin Panel Backend running on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔐 Admin Username: ${ADMIN_USERNAME}`);
  console.log(`===============================================`);
});
