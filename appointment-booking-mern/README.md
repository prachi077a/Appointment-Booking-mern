# MediBook — Doctor Appointment Booking System (MERN)

A full-stack appointment booking platform where **patients** search for doctors and book time slots, **doctors** manage their availability and confirm/cancel/complete visits, and **admins** oversee all users and bookings.

Built with MongoDB, Express, React, and Node.js (MERN) — no boilerplate CRUD, this includes real auth, role-based access control, and dynamic slot-availability logic.

---

## Why this is more than a CRUD demo

- **JWT authentication** with bcrypt password hashing, and route protection at the middleware level (`protect` + `authorize(...roles)`).
- **Three distinct roles** (patient / doctor / admin) with different dashboards and permissions enforced on the backend, not just hidden in the UI.
- **Dynamic slot generation**: a doctor sets working days, hours, and slot length; available times are *computed* per date by subtracting already-booked slots — not hardcoded.
- **Double-booking prevention** at two levels: an application-level check before insert, and a partial unique index in MongoDB (`doctor + date + time`, only for pending/confirmed appointments) as a hard guarantee.
- **Proper error handling**: a central Express error handler normalizes Mongoose validation errors, duplicate-key errors, and invalid ObjectId errors into clean JSON responses.
- **Seed script** for quick demo data (see below) so you can show it off in an interview in under two minutes.

---

## Tech stack

| Layer      | Technology                                  |
|------------|----------------------------------------------|
| Frontend   | React 18, React Router v6, Axios             |
| Backend    | Node.js, Express                             |
| Database   | MongoDB with Mongoose ODM                    |
| Auth       | JSON Web Tokens (JWT), bcryptjs              |

---

## Project structure

```
appointment-booking-mern/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Doctor, Appointment schemas
│   ├── middleware/                # auth (JWT verify), authorize (roles), errorHandler
│   ├── controllers/               # business logic per resource
│   ├── routes/                    # Express routers
│   ├── utils/                     # slot generation, JWT signing
│   ├── seed/seed.js               # demo data script
│   ├── tests/                     # Jest + Supertest suite (in-memory MongoDB)
│   ├── app.js                     # Express app (importable, testable)
│   └── server.js                  # thin entry point: connects DB, starts listener
└── frontend/
    └── src/
        ├── api/                   # axios instance + endpoint functions
        ├── context/AuthContext.js # auth state, login/register/logout
        ├── components/           # Navbar, route guards, AppointmentCard
        ├── pages/                 # Home, Login, Register, DoctorProfile,
        │                          # PatientDashboard, DoctorDashboard,
        │                          # DoctorSetup, AdminDashboard
        └── styles/global.css
```

---

## Running the automated tests

The backend has a Jest + Supertest test suite that runs against an **in-memory MongoDB** (via `mongodb-memory-server`), so it never touches your real database.

```bash
cd backend
npm install
npm test
```

What's covered:

- **`tests/slotUtils.test.js`** — unit tests for the pure slot-generation logic: correct weekday detection, evenly spaced slots, no trailing partial slot past closing time, date validation.
- **`tests/auth.test.js`** — registration (including duplicate-email rejection and blocking self-assigned admin role), login (correct/incorrect password), and `/auth/me` token verification.
- **`tests/booking.test.js`** — the interesting one: confirms available slots update after a booking, rejects out-of-hours bookings, **proves two patients can't double-book the same slot** (the 409 case), confirms a cancelled slot becomes bookable again, and checks that a doctor can't update another doctor's appointment (403).

This is also a good structure to point to in an interview: `app.js` builds the Express app without starting a listener, so tests can `require("../app")` and drive it with Supertest directly, while `server.js` is the thin entry point that actually binds to a port.

---

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free MongoDB Atlas cluster

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a real JWT_SECRET
npm run seed     # optional: populates demo admin/doctor/patient accounts
npm run dev      # starts on http://localhost:5000
```

Demo accounts created by `npm run seed`:

| Role    | Email                  | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@medibook.test      | admin123    |
| Patient | patient@medibook.test    | patient123  |
| Doctor  | meera@medibook.test      | doctor123   |
| Doctor  | rohan@medibook.test      | doctor123   |

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # REACT_APP_API_URL should point at your backend
npm start               # starts on http://localhost:3000
```

Open `http://localhost:3000`. Try booking as the demo patient, then log in as a doctor to confirm/complete it, and as admin to see everything.

---

## API overview

| Method | Route                              | Access          | Description                          |
|--------|--------------------------------------|-----------------|--------------------------------------|
| POST   | `/api/auth/register`                | Public          | Create patient/doctor account         |
| POST   | `/api/auth/login`                   | Public          | Log in, returns JWT                   |
| GET    | `/api/auth/me`                      | Authenticated   | Current user info                     |
| GET    | `/api/doctors`                      | Public          | List doctors (optional `?specialization=`) |
| GET    | `/api/doctors/:id`                  | Public          | Doctor profile                        |
| GET    | `/api/doctors/:id/slots?date=`      | Public          | Computed available slots for a date   |
| POST   | `/api/doctors`                      | Doctor          | Create own doctor profile             |
| PUT    | `/api/doctors/me`                   | Doctor          | Update own doctor profile             |
| POST   | `/api/appointments`                 | Patient         | Book a slot                           |
| GET    | `/api/appointments/my`              | Patient         | View own bookings                     |
| DELETE | `/api/appointments/:id`             | Patient         | Cancel own booking                    |
| GET    | `/api/appointments/doctor`          | Doctor          | View bookings made with you           |
| PUT    | `/api/appointments/:id/status`      | Doctor          | Confirm / cancel / complete           |
| GET    | `/api/admin/users`                  | Admin           | List all users                        |
| DELETE | `/api/admin/users/:id`              | Admin           | Remove a user                         |
| GET    | `/api/admin/appointments`           | Admin           | View every booking platform-wide      |

---

## Talking points for interviews

If you present this project, be ready to explain:

1. **Why a partial unique index** on `(doctor, date, time)` instead of relying only on an application check — it closes the race-condition window where two requests could pass the "is this slot free?" check at the same time.
2. **How slots are computed** — `generateAllSlots()` turns working hours + slot length into a list of times, then the controller subtracts times already claimed by pending/confirmed appointments for that exact date.
3. **Why passwords are hashed in a Mongoose pre-save hook** rather than in the controller — keeps the hashing logic co-located with the schema and guarantees it runs regardless of which code path creates a user.
4. **Why the JSON response strips the password field** (`toJSON` override on the User model) rather than trusting every controller to remember `.select("-password")`.
5. What you'd add for production: rate limiting on auth routes, refresh tokens, email verification, pagination on admin lists.
6. **Why `app.js` and `server.js` are split** — it lets the test suite import the Express app and drive it with Supertest, without needing a real running server or a real database (tests use an in-memory MongoDB instance).

---

## Possible extensions (good for a "future work" slide)

- Email/SMS reminders before an appointment
- Doctor reviews and ratings
- Payment integration (Stripe/Razorpay) at booking time
- Calendar view (day/week) instead of the flat slot list
- Refresh tokens + silent re-authentication
- Broader test coverage: admin routes, doctor-profile validation edge cases, and frontend component tests (React Testing Library)
