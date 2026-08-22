# Dayflow Backend API Documentation

This document outlines all the REST APIs available in the Dayflow HRMS backend to assist frontend developers with integration.

**Base URL**: `http://localhost:5000/api/v1` *(assuming development port 5000)*

> [!NOTE]
> All endpoints except `/auth/login`, `/auth/signup`, `/auth/forgot-password`, and `/auth/reset-password` require an Authorization header: `Authorization: Bearer <your_jwt_token>`

---

## 🔐 Auth APIs
**Base Path**: `/auth`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `POST` | `/signup` | Register a new employee/HR | `{ employeeId, email, password, role: 'HR'\|'EMPLOYEE' }` |
| `POST` | `/login` | Authenticate user & get token | `{ email, password }` |
| `GET`  | `/verify-email` | Verify email with token | `?token=<token>` |
| `POST` | `/send-verification-otp` | Send verification OTP | `{ email }` |
| `POST` | `/resend-verification-otp` | Resend verification OTP | `{ email }` |
| `POST` | `/verify-email` | Verify with OTP | `{ email, otp }` |
| `GET`  | `/me` | Get currently logged-in user profile | *Requires Bearer Token* |
| `POST` | `/logout` | Logout (revoke token) | *Requires Bearer Token* |
| `POST` | `/forgot-password` | Request password reset | `{ email }` |
| `POST` | `/reset-password` | Reset password using token | `{ token, password }` |

---

## 👥 Employee APIs
**Base Path**: `/employees`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/` | Get list of all employees | |
| `GET`  | `/:id` | Get employee details by ID | Path Param: `id` |
| `PATCH`| `/:id` | Update employee profile | `{ name, phone, avatarUrl, etc. }` |

---

## 📅 Attendance APIs
**Base Path**: `/attendance`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `POST` | `/punch-in` | Punch-in for the day | |
| `POST` | `/punch-out`| Punch-out for the day | |
| `GET`  | `/today` | Get today's attendance status | |
| `GET`  | `/history` | Get past attendance history | |

---

## 🏖️ Leave Management APIs
**Base Path**: `/leave`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/requests` | Get all leave requests | |
| `GET`  | `/balance` | Get current user's leave balances | |
| `POST` | `/apply` | Apply for a leave | `{ type, startDate, endDate, days, reason }` |
| `PATCH`| `/requests/:id` | Approve/Reject leave (Admin) | `{ status: 'approved'\|'rejected' }` |

---

## 💰 Payroll APIs
**Base Path**: `/payroll`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `GET`  | `/slips` | Get generated salary slips | Query: `?employeeId=<id>` (optional) |
| `GET`  | `/structure` | Get employee's salary structure config | Query: `?employeeId=<id>` (optional, defaults to self) |
| `PUT`  | `/structure` | Update salary structure (Admin only)| `{ wageType, monthlyWage, yearlyWage, ...components }` |
| `GET`  | `/overview` | Get high-level payroll overview | |

---

## 🤖 AI Assistant APIs
**Base Path**: `/ai-assistant`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `POST` | `/query` | Send a prompt to the AI Assistant | `{ prompt: string }` |
| `GET`  | `/suggestions` | Get suggested queries for UI | |
| `GET`  | `/history` | Get chat history | |
| `DELETE`| `/history`| Clear chat history | |

---

## ☁️ Upload APIs
**Base Path**: `/upload`

| Method | Endpoint | Description | Body / Query |
|--------|----------|-------------|--------------|
| `POST` | `/cloudinary` | Upload file (e.g. avatars, docs) | `FormData` with field `file` |
