# Dayflow Backend API

Backend API for the Dayflow HRMS application.

## Setup

Requirements:

- Node.js 18+
- MongoDB connection string
- Cloudinary credentials for file uploads

Install dependencies:

```bash
npm install
```

Create `Backend/.env` from `.env.example`:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=replace-with-a-long-secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayflow
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Start in development:

```bash
npm run dev
```

Build and start:

```bash
npm run build
npm start
```

The API base URL is:

```text
http://localhost:4000/api/v1
```

The port is controlled by `PORT`. The current local `.env` value takes priority over this example.

## Common Request Rules

JSON requests require:

```http
Content-Type: application/json
```

Protected requests require:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful responses generally contain `success`, `statusCode`, `data`, and `message`. Authentication responses use the explicit `user` and `accessToken` fields shown below.

Errors use this format:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password.",
  "errors": []
}
```

## Authentication APIs

### POST `/auth/signup`

Creates a user. The user cannot log in until the email is verified.

Request:

```json
{
  "employeeId": "EMP999",
  "email": "john@example.com",
  "password": "StrongPassword123!",
  "role": "EMPLOYEE"
}
```

Rules:

- Employee ID must look like `EMP999` or `EMP-999`.
- Password must contain at least 8 characters, uppercase, lowercase, and a number.
- Role must be `EMPLOYEE` or `HR`.
- Employee ID and email must be unique.

The development response includes `verificationToken` so the flow can be tested without an email provider.

### GET `/auth/verify-email?token=VERIFICATION_TOKEN`

Example:

```text
GET /api/v1/auth/verify-email?token=YOUR_VERIFICATION_TOKEN
```

Success response:

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123!"
}
```

Success response:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "employeeId": "EMP999",
    "email": "john@example.com",
    "role": "EMPLOYEE"
  },
  "accessToken": "JWT_TOKEN"
}
```

Wrong credentials return `401`. Unverified users return `403`.

### GET `/auth/me`

Requires the bearer token. Returns the current user and role.

### POST `/auth/logout`

Requires the bearer token. Revokes the current token.

### POST `/auth/forgot-password`

Request:

```json
{
  "email": "john@example.com"
}
```

The development response includes `resetToken` when the email exists.

### POST `/auth/reset-password`

Request:

```json
{
  "token": "RESET_TOKEN",
  "password": "NewStrongPassword123!"
}
```

## Employee APIs

All employee endpoints require authentication.

### GET `/employees`

Returns all employees.

### GET `/employees/:id`

Example:

```text
GET /api/v1/employees/emp_1
GET /api/v1/employees/EMP-1001
```

### PATCH `/employees/:id`

Request:

```json
{
  "name": "John Updated",
  "department": "Engineering",
  "designation": "Software Developer",
  "phone": "+91 9876543210",
  "status": "active"
}
```

## Attendance APIs

All attendance endpoints require authentication.

### POST `/attendance/punch-in`

No request body.

### POST `/attendance/punch-out`

No request body.

### GET `/attendance/today`

Returns today's attendance status.

### GET `/attendance/history`

All attendance:

```text
GET /api/v1/attendance/history
```

Filter by employee:

```text
GET /api/v1/attendance/history?employeeId=emp_1
```

## Leave APIs

All leave endpoints require authentication.

### GET `/leave/requests`

Optional filter:

```text
GET /api/v1/leave/requests?employeeId=emp_1
```

### GET `/leave/balance`

No request body.

### POST `/leave/apply`

Request:

```json
{
  "type": "casual",
  "startDate": "2026-09-01",
  "endDate": "2026-09-03",
  "days": 3,
  "reason": "Personal work"
}
```

Allowed leave types:

```text
paid, casual, sick, unpaid, maternity
```

### PATCH `/leave/requests/:id`

Example:

```text
PATCH /api/v1/leave/requests/lr_1
```

Request:

```json
{
  "status": "approved"
}
```

Allowed statuses are `approved` and `rejected`.

## Payroll APIs

All payroll endpoints require authentication.

### GET `/payroll/slips`

Optional filter:

```text
GET /api/v1/payroll/slips?employeeId=emp_1
```

### GET `/payroll/structure`

Optional employee filter:

```text
GET /api/v1/payroll/structure?employeeId=emp_1
```

### GET `/payroll/overview`

Returns payroll summary and recent salary slips.

## Upload API

### POST `/upload/cloudinary`

Requires authentication and `multipart/form-data`.

Form fields:

```text
file: choose a file
folder: dayflow_uploads
```

The file field must be named exactly `file`. Maximum file size is 10 MB.

## Testing Order

1. Call `POST /auth/signup`.
2. Copy `verificationToken` from the response.
3. Call `GET /auth/verify-email?token=...`.
4. Call `POST /auth/login`.
5. Copy `accessToken` from the response.
6. Send it as `Authorization: Bearer YOUR_ACCESS_TOKEN` to protected APIs.

Example PowerShell login:

```powershell
$body = @{ email = "john@example.com"; password = "StrongPassword123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body
```

## Data Storage

MongoDB stores users, employees, attendance, leave requests, salary slips, and revoked sessions. Seed records are inserted into an empty collection the first time that service is used.

Do not commit `.env` or expose database credentials. Use `.env.example` for safe configuration examples.

## API Documentation Rule

This README is the source of truth for the backend API. Whenever a new API is created or an existing API changes, update this document in the same change with:

- HTTP method and complete route
- Authentication and role requirements
- Query parameters and path parameters
- Request content type
- Complete request payload example
- Success response example
- Error responses and status codes
- Any required setup, database, upload, or environment changes
- A test step or example request
