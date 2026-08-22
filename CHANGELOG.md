# Changelog

All notable changes to DayFlow are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

Changes merged into `dev` but not yet cut into a release.

### Added
- AI HR Assistant integration (Groq / LLaMA 3) with per-user conversation history
- `AiAssistantWidget` chat component with markdown rendering and typing indicator
- `useAiAssistantStore` Zustand store
- `POST /api/v1/ai-assistant/chat` endpoint
- `GET /api/v1/ai-assistant/history` endpoint

### Fixed
- SSR hydration mismatch in `AppHeader` caused by client-side state accessed during server render

---

## [0.1.0] — 2026-08-10

Initial public release from the Odoo Hackathon 2026.

### Added

#### Authentication
- Company and admin account creation: `POST /auth/signup`
- Email OTP verification: `POST /auth/verify-email`, `POST /auth/send-verification-otp`, `POST /auth/resend-verification-otp`
- Token-link email verification: `GET /auth/verify-email?token=...`
- JWT login with token revocation: `POST /auth/login`, `POST /auth/logout`
- Forgot and reset password: `POST /auth/forgot-password`, `POST /auth/reset-password`
- Current user endpoint: `GET /auth/me`
- Multi-tenant isolation via `companyCode`

#### Employee Management
- Employee listing: `GET /employees`
- Employee profile: `GET /employees/:id`, `PATCH /employees/:id`
- Role-based access control: `ADMIN`, `HR`, `EMPLOYEE`

#### Attendance
- Check-in / check-out: `POST /attendance/check-in`, `POST /attendance/check-out`
- Break tracking: `POST /attendance/break/start`, `POST /attendance/break/end`
- Monthly attendance for logged-in employee: `GET /attendance/me?month=YYYY-MM`
- Today's status for logged-in employee: `GET /attendance/me/today`
- Today's attendance for all employees (ADMIN/HR): `GET /attendance/today`
- Employee monthly attendance (ADMIN/HR): `GET /attendance/employees/:id?month=YYYY-MM`
- Payable-days calculation: `GET /attendance/employees/:id/payable-days?month=YYYY-MM`
- Attendance history: `GET /attendance/history`
- Separate `attendance` and `attendance_breaks` MongoDB collections

#### Leave Management
- Leave application: `POST /leave/apply` (types: paid, casual, sick, unpaid, maternity)
- Leave balance: `GET /leave/balance`
- Leave request listing with optional employee filter: `GET /leave/requests`
- Admin/HR approval: `PATCH /leave/requests/:id`

#### Payroll
- Salary structure: `GET /payroll/structure`
- Payslip listing: `GET /payroll/slips`
- Payroll overview: `GET /payroll/overview`

#### Announcements
- Announcement listing: `GET /announcements`
- Create announcement (ADMIN/HR): `POST /announcements`

#### File Upload
- Cloudinary upload: `POST /upload/cloudinary` (multipart/form-data, 10 MB limit)

#### Frontend
- Next.js 16 App Router with SSR
- Admin portal: employee management, attendance overview, leave approvals, payroll dashboard
- Employee portal: self-service check-in/check-out, leave application, payslip view, profile
- Light / dark theme via `next-themes`
- Radix UI component system
- Recharts dashboard visualizations
- Zustand state management
- Mobile-responsive layout

---

## Legend

| Tag | Meaning |
|---|---|
| `Added` | New features or endpoints |
| `Changed` | Changes to existing behaviour |
| `Deprecated` | Features to be removed in a future release |
| `Removed` | Features removed in this release |
| `Fixed` | Bug fixes |
| `Security` | Security fixes — update immediately |

[Unreleased]: https://github.com/adhavan13/odoo_hackathon_dayflow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/adhavan13/odoo_hackathon_dayflow/releases/tag/v0.1.0
