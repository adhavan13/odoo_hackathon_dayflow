# Dayflow Backend API Documentation

This document outlines all REST APIs in the Dayflow HRMS backend to assist frontend developers with seamless integration.


**Base URL**: `http://localhost:4000/api/v1` _(the port is controlled by `PORT` in `.env`)_


> [!IMPORTANT]
> All endpoints except public authentication endpoints (`/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`) require an Authorization header:  
> `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 🔑 Default Test Credentials
Use these pre-seeded accounts for testing:

- **Admin / HR Officer**:
  - **Email**: `sarah.j@company.com`
  - **Password**: `StrongPassword123!`
  - **Role**: `HR` / `ADMIN`
- **Employee**:
  - **Email**: `alex.rivera@company.com`
  - **Password**: `StrongPassword123!`
  - **Role**: `EMPLOYEE`

---

## 🔐 1. Authentication APIs
**Base Path**: `/auth`

### `POST /auth/signup`
- **Access**: Public
- **Body**:
  ```json
  {
    "companyName": "Acme Corp",
    "name": "John Doe",
    "email": "john@acme.com",
    "phone": "+1234567890",
    "password": "StrongPassword123!",
    "confirmPassword": "StrongPassword123!"
  }
  ```

### `POST /auth/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "sarah.j@company.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response**: Returns `{ user, accessToken }`.

### `GET /auth/me`
- **Access**: Authenticated
- **Description**: Get currently logged-in user profile.

### `POST /auth/logout`
- **Access**: Authenticated
- **Description**: Revokes the JWT token.

### `POST /auth/forgot-password`
- **Body**: `{ "email": "john@acme.com" }`

### `POST /auth/reset-password`
- **Body**: `{ "token": "RESET_TOKEN", "password": "NewStrongPassword123!" }`

---

## 👥 2. Employee Profile Management APIs
**Base Path**: `/employees`

### `GET /employees`
- **Access**: Authenticated (All Roles)
- **Description**: Get all employees list.

### `GET /employees/:id`
- **Access**: Authenticated (All Roles)
- **Description**: Get single employee details by ID or Employee Code.

### `PATCH /employees/:id`
- **Access**: Authenticated
- **Body**: `{ "phone": "+1999888777", "avatarUrl": "https://...", "designation": "Frontend Dev" }`
- **Note**: Employees can update their contact/avatar info. Admins can update all details.

---

## 📅 3. Attendance Management APIs
**Base Path**: `/attendance`

### `POST /attendance/punch-in`
- **Access**: Authenticated (Employee)
- **Description**: Punch in for the current workday.

### `POST /attendance/punch-out`
- **Access**: Authenticated (Employee)
- **Description**: Punch out for the current workday.

### `GET /attendance/today`
- **Access**: Authenticated
- **Description**: Get status for today (checkInTime, checkOutTime, hoursWorked, isCheckedIn, status).

### `GET /attendance/history`
- **Access**: Authenticated
- **Query Params**: `?employeeId=<ID>` (Optional for HR/Admin)
- **Description**: Get attendance log history.

---

## 🏖️ 4. Leave & Time-Off Management APIs
**Base Path**: `/leave`

### `GET /leave/requests`
- **Access**: Authenticated
- **Query Params**: `?employeeId=<ID>` (Optional)
- **Behavior**:
  - `EMPLOYEE` role: Automatically scoped to **only their own** leave requests.
  - `HR` / `ADMIN` role: Can view **all** employee leave requests or filter by specific employee.

### `GET /leave/balance`
- **Access**: Authenticated
- **Query Params**: `?employeeId=<ID>` (HR/Admin only)
- **Response**:
  ```json
  {
    "employeeId": "emp_1",
    "paid": { "total": 24, "used": 0, "remaining": 24 },
    "sick": { "total": 7, "used": 0, "remaining": 7 },
    "unpaid": { "total": 30, "used": 0, "remaining": 30 }
  }
  ```

### `POST /leave/apply`
- **Access**: Authenticated (Employee)
- **Body**:
  ```json
  {
    "type": "paid", // Options: "paid" | "sick" | "unpaid"
    "startDate": "2026-08-25",
    "endDate": "2026-08-27",
    "days": 3,
    "reason": "Family trip",
    "attachmentUrl": "https://res.cloudinary.com/.../cert.pdf" // Optional (e.g., for sick leave)
  }
  ```

### `PATCH /leave/requests/:id`
- **Access**: Authenticated (**Admin / HR Officers Only**)
- **Body**: `{ "status": "approved" }` or `{ "status": "rejected" }`
- **Behavior**:
  - Automatically updates the request status.
  - **Dynamic Deduction**: If set to `"approved"`, the system automatically deducts `days` from the employee's `leave_balances` profile in MongoDB!

---

## 💰 5. Payroll & Salary Management APIs
**Base Path**: `/payroll`

### `GET /payroll/slips`
- **Access**: Authenticated
- **Query Params**: `?employeeId=<ID>` (Optional)
- **Description**: Returns generated salary slips. Read-only for employees.

### `GET /payroll/structure`
- **Access**: Authenticated
- **Query Params**: `?employeeId=<ID>` (Optional)
- **Response**: Returns full salary breakdown including automatic calculations:
  ```json
  {
    "employeeId": "emp_1",
    "wageType": "Fixed wage",
    "monthlyWage": 50000,
    "yearlyWage": 600000,
    "workingDaysPerWeek": 5,
    "hoursPerWeek": 40,
    "basicPercent": 50,
    "hraPercent": 50,
    "calculated": {
      "basic": 25000,
      "hra": 12500,
      "performanceBonus": 2082.5,
      "lta": 2082.5,
      "standardAllowance": 4167,
      "fixedAllowance": 4168,
      "pfEmployee": 3000,
      "pfEmployer": 3000,
      "professionalTax": 200,
      "netPay": 46800
    }
  }
  ```

### `PUT /payroll/structure`
- **Access**: Authenticated (**Admin / HR Officers Only**)
- **Body**: Updates salary config parameters (e.g. `monthlyWage`, `basicPercent`, `pfEmployeePercent`, etc.).

### `GET /payroll/overview`
- **Access**: Authenticated (**Admin / HR Officers Only**)
- **Description**: High-level summary of total payroll, pending approvals, and upcoming pay date.

---

## 🤖 6. AI Assistant APIs
**Base Path**: `/ai-assistant`

### `POST /ai-assistant/query`
- **Body**: `{ "prompt": "How many leave days do I have remaining?" }`

### `GET /ai-assistant/suggestions`
- **Description**: Get sample suggested prompts for the UI.

### `GET /ai-assistant/history` & `DELETE /ai-assistant/history`
- **Description**: Manage conversation history.

---

## ☁️ 7. File Upload API
**Base Path**: `/upload`

### `POST /upload/cloudinary`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Body**: File payload under field `file`
- **Response**: `{ "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg" }`
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
| `PATCH` | `/requests/:id` | Approve/Reject leave (Admin)      | `{ status: 'Approved'\|'Rejected' }`         |
| `GET`   | `/holidays`     | Get all company holidays          |                                              |
| `POST`  | `/holidays`     | Create company holiday / alert    | `{ date: string, name: string }`             |

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

---

## 🏖️ 5. Time Off / Leave Management APIs

**Base Path**: `/leave`

| Method  | Endpoint         | Access                          | Description                                                                              | Body / Query                                                                                            |
| ------- | ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `GET`   | `/requests`      | Authenticated                   | Get leave requests. Employees get only their own; Admin/HR get all or filter by employee | Query: `?employeeId=<id>` (optional for Admin/HR)                                                       |
| `GET`   | `/balance`       | Authenticated                   | Get remaining paid, sick, and unpaid leave balances                                      | Query: `?employeeId=<id>` (optional for Admin/HR)                                                       |
| `POST`  | `/apply`         | Authenticated                   | Apply for a new leave request                                                            | `{ employeeId, employeeName, leaveType, startDate, endDate, daysCount, reason, attachmentUrl }`         |
| `PATCH` | `/requests/:id`  | Admin / HR Officer              | Approve or reject a leave request and auto-adjust balances                               | `{ status: "Approved" \| "Rejected" }`                                                                  |

---

## ⚡ 6. Recent Activity & Analytics APIs

**Base Path**: `/activity`

| Method | Endpoint     | Access        | Description                                                          | Body / Query                                            |
| ------ | ------------ | ------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| `GET`  | `/`          | Authenticated | Get recent activity logs with category, action, and limit filters    | Query: `?category=attendance\|leave&action=...&limit=50` |
| `GET`  | `/analytics` | Authenticated | Get summary analytics counters (total events, leaves, punches, etc.) |                                                         |
| `POST` | `/`          | Authenticated | Log a new system activity event                                      | `{ action, category, description, details }`            |


