# DayFlow — HRMS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

DayFlow is an open-source Human Resource Management System (HRMS) built with Next.js and Express. It covers employee management, attendance, leave, payroll, announcements, and an AI-powered HR assistant, all in a single platform.

Built during the **Odoo Hackathon 2026**.

[API Reference](Backend/README.md) — [Report a Bug](https://github.com/adhavan13/odoo_hackathon_dayflow/issues) — [Request a Feature](https://github.com/adhavan13/odoo_hackathon_dayflow/issues)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Employee Management
- Multi-tenant company isolation — each company's data is fully separated
- Role-based access control: `ADMIN`, `HR`, `EMPLOYEE`
- Employee directory with profile management
- File and avatar uploads via Cloudinary

### Attendance
- Check-in / check-out with break tracking
- Daily, monthly, and historical attendance reports
- Payable-days calculation (accounts for present days, leave, half-days)
- Multiple attendance sources: `ASSIGNED_ATTENDANCE`, self-service

### Leave Management
- Leave types: Paid, Casual, Sick, Unpaid, Maternity
- Leave balance tracking
- Admin / HR approval workflow

### Payroll
- Salary structure configuration at the component level
- Monthly payslip generation based on attendance and leave data
- Payroll overview dashboard

### AI HR Assistant
- Conversational AI using the Groq API (LLaMA 3 model)
- HR-context aware: responds to policy, attendance, leave, and payroll queries
- Per-user conversation history
- Embedded chat widget in the employee portal

### Announcements
- Company-wide announcements created by Admin or HR roles
- Announcement feed in the employee dashboard

### Authentication
- JWT-based stateless authentication with token revocation on logout
- Email OTP verification on signup
- Password hashing with bcrypt
- Forgot password / reset password flow

---

## Architecture

```
Frontend (Next.js 16, SSR)
        |
        | REST API (JSON)
        |
Backend (Express.js, TypeScript)
        |
        | Native Driver
        |
MongoDB (multi-tenant, company-scoped collections)

External services:
  - Cloudinary  (file and image storage)
  - Groq API    (AI assistant — LLaMA 3)
  - Nodemailer  (transactional email)
```

### Data Tenancy

Each company that registers is assigned a unique `companyCode`. All records — employees, attendance, leave, payroll, announcements — are scoped to that company. No cross-company data access is possible.

---

## Tech Stack

### Frontend

| Dependency | Version | Purpose |
|---|---|---|
| Next.js | 16 | SSR / App Router framework |
| React | 19 | UI rendering |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Radix UI | various | Accessible headless component primitives |
| Zustand | 5 | Global client state management |
| Framer Motion | 13 | Animations |
| React Hook Form | 7 | Form state management |
| Zod | 3 | Schema validation |
| Recharts | 2 | Data visualizations |
| Lucide React | 0.454 | Icons |

### Backend

| Dependency | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4 | HTTP framework |
| TypeScript | 5 | Type safety |
| MongoDB (native driver) | 7 | Primary database |
| jsonwebtoken | 9 | JWT auth |
| bcryptjs | 2 | Password hashing |
| Cloudinary SDK | 2 | File uploads |
| Nodemailer | 6 | Email delivery |
| Groq SDK | — | AI completions |
| Zod | 3 | Request validation |

---

## Getting Started

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| Git | any recent version |

You will need accounts and API keys for:
- **MongoDB Atlas** — [cloud.mongodb.com](https://cloud.mongodb.com) (or a local MongoDB instance)
- **Cloudinary** — [cloudinary.com](https://cloudinary.com) (free tier is sufficient)
- **Groq API** — [console.groq.com](https://console.groq.com) (free tier is sufficient)

---

### Backend Setup

```bash
git clone https://github.com/adhavan13/odoo_hackathon_dayflow.git
cd odoo_hackathon_dayflow/Backend

npm install

cp .env.example .env
# Edit .env with your values

npm run dev
```

The API server starts at `http://localhost:4000`.
All endpoints are under the base path `http://localhost:4000/api/v1`.

**Production build:**
```bash
npm run build
npm start
```

---

### Frontend Setup

```bash
cd Frontend

npm install

# Create .env.local from the example
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

npm run dev
```

The frontend starts at `http://localhost:3000`.

---

### Environment Variables

#### Backend (`Backend/.env`)

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dayflow
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend (`Frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

> Never commit `.env` or `.env.local` files. Both are in `.gitignore`. Use `.env.example` and `.env.local.example` as the committed references.

---

## Project Structure

```
odoo_hackathon_dayflow/
├── Backend/
│   ├── src/
│   │   ├── app.ts                      # Express app setup
│   │   ├── index.ts                    # Server entry point
│   │   ├── config/                     # DB connection, env config
│   │   ├── controllers/                # Route handler logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── employee.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── leave.controller.ts
│   │   │   ├── payroll.controller.ts
│   │   │   ├── announcement.controller.ts
│   │   │   └── aiAssistant.controller.ts
│   │   ├── routes/                     # Express router definitions
│   │   ├── middlewares/                # Auth, error, upload middleware
│   │   ├── services/                   # Business logic
│   │   ├── utils/                      # JWT helpers, email, validators
│   │   └── scripts/                    # Seed scripts
│   ├── .env.example
│   ├── vercel.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                       # Full API reference
│
├── Frontend/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/                       # Login, signup, verification pages
│   │   ├── admin/                      # Admin portal
│   │   └── employee/                   # Employee portal
│   ├── components/
│   │   ├── ui/                         # Radix-based component library
│   │   ├── layout/                     # Sidebar, header, app shell
│   │   ├── ai-assistant/               # AI chat widget
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── payroll/
│   │   └── profile/
│   ├── store/                          # Zustand stores
│   │   ├── useAuthStore.ts
│   │   └── useAiAssistantStore.ts
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── .env.local.example
│   └── package.json
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## API Reference

The full REST API reference is in [`Backend/README.md`](Backend/README.md).

### Modules

| Module | Base Path | Auth Required |
|---|---|---|
| Authentication | `/api/v1/auth` | Partial |
| Employees | `/api/v1/employees` | Yes |
| Attendance | `/api/v1/attendance` | Yes |
| Leave | `/api/v1/leave` | Yes |
| Payroll | `/api/v1/payroll` | Yes |
| Announcements | `/api/v1/announcements` | Yes |
| AI Assistant | `/api/v1/ai-assistant` | Yes |
| File Upload | `/api/v1/upload` | Yes |

Protected endpoints require the header:
```
Authorization: Bearer <token>
```

Standard response envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

Error envelope:
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password.",
  "errors": []
}
```

---

## Deployment

### Vercel

The repository includes a `Backend/vercel.json` configuration for serverless deployment.

**Backend:**
```bash
cd Backend
vercel --prod
```

Set all environment variables from `Backend/.env.example` in the Vercel project dashboard.

**Frontend:**
```bash
cd Frontend
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

### Other platforms (Railway, Render)

Both platforms support Node.js natively.

- Backend: build command `npm run build`, start command `npm start`
- Frontend: build command `npm run build`, start command `npm start`

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full contributor guide, including the branching strategy, commit convention, coding standards, and pull request process.

Quick steps:
1. Fork the repository
2. Create a branch from `dev` — e.g. `git checkout -b feat/holiday-calendar`
3. Make your changes
4. Open a pull request targeting the `dev` branch

---

## Security

To report a security vulnerability, do not open a public issue. See [SECURITY.md](SECURITY.md) for the responsible disclosure process.

---

## License

DayFlow is released under the [MIT License](LICENSE).

---

## Acknowledgements

- Built at the Odoo Hackathon 2026
- UI components: [Radix UI](https://radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
- AI inference: [Groq](https://groq.com/)
- Icons: [Lucide](https://lucide.dev/)
