import app from './app.js';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// Initialize Database connection on standalone startup
initDatabase();

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚡ BRL Admin Panel Backend running on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔐 Admin Username: ${ADMIN_USERNAME}`);
  console.log(`===============================================`);
});
