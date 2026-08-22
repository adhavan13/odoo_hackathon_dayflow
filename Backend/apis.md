# Dayflow Backend API Documentation

This document outlines all REST APIs in the Dayflow HRMS backend to assist frontend developers with seamless integration.

**Base URL**: `http://localhost:5000/api/v1`

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
