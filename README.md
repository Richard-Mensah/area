# EduTrack — Student Attendance & Analytics Platform

A full-stack Next.js 16 web application for tracking student attendance, predicting academic risk, and managing school data across multiple classes and subjects. Built with MongoDB, JWT authentication, and facial recognition login.

---

## Features

### Authentication
- Email/password login with role-based access
- Facial recognition login via face-api.js (browser-side, no third-party service)
- JWT sessions stored in HTTP-only cookies
- Route protection via Next.js Proxy (middleware)

### Role-Based Access

| Feature | Admin | Teacher | Student |
|---|---|---|---|
| School-wide overview dashboard | Yes | — | — |
| My classes overview | — | Yes | — |
| Personal attendance dashboard | — | — | Yes |
| Mark attendance | Yes (all classes) | Yes (own subjects) | No |
| View student list | Yes (full CRUD) | Yes (read-only, own classes) | No |
| Academic predictions | Yes (all students) | Yes (own classes) | Own only |
| User management | Yes | No | No |
| Subject management | Yes | No | No |
| Enrol face for login | Yes | Yes | Own profile |
| Export attendance CSV | Yes | Yes (own classes) | No |

### Analytics & Predictions
- 30-day attendance trend charts (Recharts)
- Per-subject attendance breakdown bar chart
- Today's attendance pie chart
- Rule-based academic prediction engine:
  - Attendance rate with late = 0.5 credit
  - Consecutive absence penalties (3+, 5+, 7+ days)
  - Late pattern penalty (>20% late rate)
  - Risk levels: At Risk / Needs Improvement / Good Standing / Excellent
  - Predicted grade bands: F / D / B / A
  - Actionable intervention suggestions

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (jose) + bcryptjs, HTTP-only cookies
- **Charts:** Recharts
- **Forms:** react-hook-form + Zod
- **Data fetching:** SWR
- **Face recognition:** face-api.js (TinyFaceDetector, 128-dim descriptors)
- **Icons:** lucide-react

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-string
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### 3. Seed the database

Start the dev server, then call the seed endpoint once:

```bash
npm run dev
curl -X POST http://localhost:3000/api/seed
```

This creates:
- 3 user accounts (teacher, admin, student)
- 12 students across 4 classes (10A, 10B, 11A, 11B)
- 8 subjects assigned to teachers
- 60 days of synthetic attendance history (with some students deliberately at-risk for demo purposes)

### 4. Log in

| Email | Password | Role |
|---|---|---|
| admin@school.com | password123 | Admin |
| teacher@school.com | password123 | Teacher |
| student@school.com | password123 | Student (Alice Johnson) |

---

## Face Recognition Setup

Model files are required in `/public/models/`. The following files must be present:

```
public/models/
  tiny_face_detector_model-weights_manifest.json
  tiny_face_detector_model-shard1
  face_landmark_68_model-weights_manifest.json
  face_landmark_68_model-shard1
  face_recognition_model-weights_manifest.json
  face_recognition_model-shard1
  face_recognition_model-shard2
```

Download from the [face-api.js models repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).

To enrol a face:
- **Admin/Teacher:** Go to a student's profile page and click "Enrol Face"
- **Student:** Go to My Profile and click "Enrol Face"
- **For login:** Faces are enrolled against user accounts via My Profile or `/api/profile/face`

---

## Project Structure

```
app/
  api/                    # Backend API routes
    auth/                 # login, face-login, logout, me
    students/             # CRUD + face enrolment
    subjects/             # CRUD
    attendance/           # mark single + bulk
    users/                # admin user management
    seed/                 # database seeder
  dashboard/
    page.tsx              # Role-aware overview (server component)
    attendance/           # Attendance marking
    students/             # Student directory
    predictions/          # Academic predictions table
    users/                # Admin: user management
    subjects/             # Admin: subject management
    my-attendance/        # Student: personal attendance history
    my-prediction/        # Student: personal prediction
    my-profile/           # Student: profile + face enrolment
  login/                  # Login page (email + face tabs)

components/
  features/
    admin/                # UserTable, SubjectManager
    analytics/            # Charts, StatsCard, Dashboard
    attendance/           # AttendanceTable, Controls, Summary
    auth/                 # LoginForm, FaceLogin
    predictions/          # PredictionCard, PredictionTable
    student/              # MyDashboard
    students/             # StudentsDirectory
  layout/                 # Sidebar (role-gated nav), Navbar
  ui/                     # Button, Input, Badge, Modal, Toast, etc.

lib/
  mongodb.ts              # Connection singleton
  auth.ts                 # JWT sign/verify, cookie helpers
  attendance.ts           # Pure computation functions
  prediction.ts           # Academic prediction engine
  models/                 # Mongoose schemas

hooks/
  useAuth.ts              # SWR-based session hook
  useAttendance.ts        # SWR-based data hook (students, subjects, records)
  usePrediction.ts        # Memoized prediction calculations
```

---

## API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Email/password → JWT cookie |
| `/api/auth/face-login` | POST | Public | Face descriptor → JWT cookie |
| `/api/auth/logout` | POST | Any | Clear session cookie |
| `/api/auth/me` | GET | Any | Get current session user |
| `/api/seed` | POST | Public | Seed database (idempotent) |
| `/api/students` | GET | All | List students (role-filtered) |
| `/api/students` | POST | Admin | Create student |
| `/api/students/:id` | GET/PUT/DELETE | Role-gated | Manage student |
| `/api/students/:id/face` | PUT | Admin/Teacher | Enrol student face |
| `/api/subjects` | GET/POST | Role-gated | List/create subjects |
| `/api/subjects/:id` | PUT/DELETE | Admin | Manage subject |
| `/api/attendance` | GET/POST | Role-gated | Query/mark attendance |
| `/api/attendance/bulk` | POST | Teacher/Admin | Bulk mark attendance |
| `/api/users` | GET/POST | Admin | List/create users |
| `/api/users/:id` | GET/PUT/DELETE | Admin | Manage user |
| `/api/profile/face` | PUT | Any | Enrol own face for login |

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy — the build runs `next build` with Turbopack
5. After first deploy, call `POST /api/seed` once to populate the database

> Make sure `/public/models/` files are committed to the repository so face recognition works in production.
