# Dayflow Backend API Documentation

This document outlines all the REST APIs available in the Dayflow HRMS backend to assist frontend developers with integration.

**Base URL**: `http://localhost:4000/api/v1` _(the port is controlled by `PORT` in `.env`)_

> [!NOTE]
> All endpoints except `/auth/login`, `/auth/signup`, `/auth/forgot-password`, and `/auth/reset-password` require an Authorization header: `Authorization: Bearer <your_jwt_token>`

---

## 🔐 Auth APIs

**Base Path**: `/auth`

| Method | Endpoint                   | Description                          | Body / Query                                              |
| ------ | -------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `POST` | `/signup`                  | Register a new employee/HR           | `{ employeeId, email, password, role: 'HR'\|'EMPLOYEE' }` |
| `POST` | `/login`                   | Authenticate user & get token        | `{ email, password }`                                     |
| `GET`  | `/verify-email`            | Verify email with token              | `?token=<token>`                                          |
| `POST` | `/send-verification-otp`   | Send verification OTP                | `{ email }`                                               |
| `POST` | `/resend-verification-otp` | Resend verification OTP              | `{ email }`                                               |
| `POST` | `/verify-email`            | Verify with OTP                      | `{ email, otp }`                                          |
| `GET`  | `/me`                      | Get currently logged-in user profile | _Requires Bearer Token_                                   |
| `POST` | `/logout`                  | Logout (revoke token)                | _Requires Bearer Token_                                   |
| `POST` | `/forgot-password`         | Request password reset               | `{ email }`                                               |
| `POST` | `/reset-password`          | Reset password using token           | `{ token, password }`                                     |

---

## 👥 Employee APIs

**Base Path**: `/employees`

| Method  | Endpoint | Description                | Body / Query                       |
| ------- | -------- | -------------------------- | ---------------------------------- |
| `GET`   | `/`      | Get list of all employees  |                                    |
| `GET`   | `/:id`   | Get employee details by ID | Path Param: `id`                   |
| `PATCH` | `/:id`   | Update employee profile    | `{ name, phone, avatarUrl, etc. }` |

---

## 📅 Attendance APIs

**Base Path**: `/attendance`

| Method | Endpoint                                            | Description                                       | Body / Query                               |
| ------ | --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| `GET`  | `/me?month=YYYY-MM`                                 | Get logged-in employee's monthly attendance       | Optional `month`                           |
| `GET`  | `/me/today`                                         | Get logged-in employee's current-day attendance   |                                            |
| `POST` | `/check-in`                                         | Check in using authenticated user and server time | `{ source: "ASSIGNED_ATTENDANCE" }`        |
| `POST` | `/check-out`                                        | Check out and calculate work/extra hours          | `{}`                                       |
| `POST` | `/break/start`                                      | Start a break for the current session             | `{}`                                       |
| `POST` | `/break/end`                                        | End the active break and calculate duration       | `{}`                                       |
| `GET`  | `/today`                                            | Get today's attendance for all employees          | Optional `?search=name`; `ADMIN`/`HR` only |
| `GET`  | `/employees/:employeeId?month=YYYY-MM`              | Get one employee's monthly attendance             | `ADMIN`/`HR` only                          |
| `GET`  | `/employees/:employeeId/payable-days?month=YYYY-MM` | Calculate server-side payable days                | `ADMIN`/`HR` only                          |
| `GET`  | `/history`                                          | Get attendance history                            | Optional `?employeeId=id`                  |

The legacy `/punch-in` and `/punch-out` routes are aliases for `/check-in` and `/check-out`.

### Check-in rules

The employee is identified from the bearer token. Do not send `employeeId` from the frontend. A duplicate check-in returns `409`.

### Monthly employee response

```json
{
  "success": true,
  "month": "2026-08",
  "summary": {
    "totalWorkingDays": 21,
    "daysPresent": 1,
    "daysAbsent": 0,
    "daysOnLeave": 0,
    "totalWorkHours": "08:00",
    "totalExtraHours": "00:00"
  },
  "attendance": []
}
```

### Check-in request

```json
{
  "source": "ASSIGNED_ATTENDANCE"
}
```

### Break and check-out responses

```json
{
  "success": true,
  "message": "Break started",
  "break": {
    "id": "break_uuid",
    "startTime": "13:00"
  }
}
```

```json
{
  "success": true,
  "break": {
    "startTime": "13:00",
    "endTime": "14:00",
    "duration": "01:00"
  }
}
```

### Payable-days response

```json
{
  "success": true,
  "employeeId": "EMP001",
  "month": "2026-08",
  "totalWorkingDays": 21,
  "presentDays": 20,
  "paidLeaveDays": 1,
  "unpaidLeaveDays": 0,
  "missingAttendanceDays": 0,
  "payableDays": 21
}
```

### MongoDB collections

`attendance` stores one record per employee per date:

```text
id, employeeId, employeeName, date, checkIn, checkOut, status,
workMinutes, breakMinutes, extraMinutes, attendanceSource,
createdAt, updatedAt
```

`attendance_breaks` stores individual breaks:

```text
id, attendanceId, employeeId, startTime, endTime,
durationMinutes, createdAt
```

Statuses are `PRESENT`, `ABSENT`, `HALF_DAY`, and `LEAVE`. `ADMIN` and `HR` can view other employees; `EMPLOYEE` receives `403` for admin attendance endpoints.

---

## 🏖️ Leave Management APIs

**Base Path**: `/leave`

| Method  | Endpoint        | Description                       | Body / Query                                 |
| ------- | --------------- | --------------------------------- | -------------------------------------------- |
| `GET`   | `/requests`     | Get all leave requests            |                                              |
| `GET`   | `/balance`      | Get current user's leave balances |                                              |
| `POST`  | `/apply`        | Apply for a leave                 | `{ type, startDate, endDate, days, reason }` |
| `PATCH` | `/requests/:id` | Approve/Reject leave (Admin)      | `{ status: 'approved'\|'rejected' }`         |

---

## 💰 Payroll APIs

**Base Path**: `/payroll`

| Method | Endpoint     | Description                            | Body / Query                                           |
| ------ | ------------ | -------------------------------------- | ------------------------------------------------------ |
| `GET`  | `/slips`     | Get generated salary slips             | Query: `?employeeId=<id>` (optional)                   |
| `GET`  | `/structure` | Get employee's salary structure config | Query: `?employeeId=<id>` (optional, defaults to self) |
| `PUT`  | `/structure` | Update salary structure (Admin only)   | `{ wageType, monthlyWage, yearlyWage, ...components }` |
| `GET`  | `/overview`  | Get high-level payroll overview        |                                                        |

---

## 🤖 AI Assistant APIs

**Base Path**: `/ai-assistant`

| Method   | Endpoint       | Description                       | Body / Query         |
| -------- | -------------- | --------------------------------- | -------------------- |
| `POST`   | `/query`       | Send a prompt to the AI Assistant | `{ prompt: string }` |
| `GET`    | `/suggestions` | Get suggested queries for UI      |                      |
| `GET`    | `/history`     | Get chat history                  |                      |
| `DELETE` | `/history`     | Clear chat history                |                      |

---

## ☁️ Upload APIs

**Base Path**: `/upload`

| Method | Endpoint      | Description                      | Body / Query                 |
| ------ | ------------- | -------------------------------- | ---------------------------- |
| `POST` | `/cloudinary` | Upload file (e.g. avatars, docs) | `FormData` with field `file` |
