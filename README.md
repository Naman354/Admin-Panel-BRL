# BRL Admin Panel - Registration & Attendance Console

A modern, high-performance **Admin Panel** for the event registration portal built with **React (TypeScript)**, **Express / Node.js**, and **MongoDB**. Designed in a clean **Light Theme** with real-time demographic metrics, a participants directory with Excel export, and day-of-event barcode attendance verification with strict duplicate check-in prevention.

---

## 🚀 Key Features

### 1. 🔐 Admin Authentication
- Hardcoded secure credentials configured in `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
- Protected API routes and client session management using JWT Bearer tokens.
- Clean light sign-in interface with auto-fill shortcut for fast testing.

### 2. 📊 Registration Analytics Dashboard
- **Key Performance Indicators (KPIs)**: Total registrations count, attendance verified count & rate (%), pending check-ins, barcode scans vs. manual check-ins.
- **Gender-wise Distribution**: Interactive donut chart with percentages (Male, Female, Other).
- **Residency-wise Distribution**: Campus Hostelers vs. Commuting Day Scholars comparison with dual progress meters and stat cards.
- **Branch-wise Distribution**: Department breakdown (CSE, IT, CSIT, CSE(AIML), ECE, etc.) comparing total registrations vs. attendees present.
- **Academic Year Breakdown**: 1st through 4th-year student distribution derived from registration records.
- **Registration Velocity Timeline**: Trajectory of signups over time.
- **Live Attendance Feed**: Real-time ticker of recently verified attendees with timestamps.

### 3. 👥 Participants Directory (Hamburger Navigation)
- Collapsible responsive hamburger sidebar navigation (Dashboard, Participants, Attendance Scanner).
- Real-time search across Name, University Roll Number, Student Number, Email, and Phone.
- Multi-dimensional filters: Branch, Academic Year, Gender, Residency, and Attendance Status (Present / Absent).
- **Export to Excel (`.xlsx`)**: One-click download of the complete participant roster (or filtered selection) with styled column headers and timestamps via SheetJS (`xlsx`).
- Detailed Participant Drawer / Modal with digital barcode preview, contact information, and attendance history.
- Quick "Add Walk-in" desk registration on the day of the event directly into MongoDB.

### 4. 📷 Day-of-Event Attendance Station
- **Dual Verification Modes**:
  1. **Camera Barcode Scanner**: Scans 1D barcodes (Code 128, Code 39, EAN, UPC) and QR codes from confirmation emails using the webcam.
  2. **Manual Student / Roll Number Entry**: Input box with Enter key submission.
  3. **Hardware USB / Wireless Scanner Support**: Automatically intercepts high-speed keystrokes from handheld barcode scanner guns without requiring focus in an input field!
- **Strict Single Check-in Rule**:
  - Attendance can be marked **only once** per participant.
  - **First check-in**: Triggers a green celebration card, updates live counters, and plays a harmonic melodic chime via the Web Audio API.
  - **Duplicate check-in**: Triggers an amber/red warning card (`⚠️ DUPLICATE CHECK-IN REJECTED`), shows the original check-in timestamp, and sounds an audio warning buzzer.

### 5. 🗄️ Connected to Live MongoDB
- Directly connects to your live MongoDB cluster (`EXPERT-SEMINAR-REGISTRATION`) and collection (`registrations`).
- Operates 100% on actual participant data with live check-in updates and single check-in enforcement.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Theme**: Clean Modern Light Theme (Apple / Linear SaaS aesthetic)
- **Charts & Data Viz**: Recharts (SVG-based reactive charts)
- **Icons**: Lucide React
- **Barcode & QR Decoding**: `html5-qrcode` & Hardware HID scanner listener
- **Audio Feedback**: Web Audio API Synthesizer (Harmonic chimes and buzzers)
- **Spreadsheet Generation**: SheetJS (`xlsx`)
- **Backend**: Express.js, TypeScript (`tsx`)
- **Database**: MongoDB via Mongoose

---

## ⚙️ Environment Variables (`.env`)

```env
# Server Port
PORT=5000

# MongoDB Database Connection String
MONGODB_URI=mongodb+srv://naman:naman123@clusternew.iabfdwr.mongodb.net/EXPERT-SEMINAR-REGISTRATION?appName=ClusterNEW
DB_NAME=EXPERT-SEMINAR-REGISTRATION

# Admin Login Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin@portal2026

# JWT Authentication Secret
JWT_SECRET=supersecret_admin_jwt_token_portal_2026_xyz

# Vite Frontend API Base URL
VITE_API_URL=/api
```

---

## 🏃 Running the Application

```powershell
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Admin Username**: `admin`
- **Admin Password**: `admin@portal2026` *(defined in `.env`)*
