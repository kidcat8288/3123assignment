# COMP 3123 Assignment 1 – Backend

Secure RESTful backend API built with Node.js, Express and MongoDB.

Users sign up and log in to receive a JWT. With that token they can create, view, update and delete **their own** employees. Every employee belongs to the user who created it, and no user can see or change another user's employees.

**Student:** _Your Name_ (_Student #_)
**Repository:** `Student#_COMP3123_Assignment1`

---

## Contents

- [Technologies](#technologies)
- [Project structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API](#api)
- [Authentication](#authentication)
- [Authorization (employee ownership)](#authorization-employee-ownership)
- [Security](#security)
- [Error handling and status codes](#error-handling-and-status-codes)
- [Logging](#logging)
- [Health check](#health-check)
- [Testing with Postman](#testing-with-postman)
- [Sample credentials](#sample-credentials)

---

## Technologies

| Area | Technology |
| --- | --- |
| Runtime / framework | Node.js (v20+), Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`), password hashing with `bcryptjs` |
| Validation | `express-validator` |
| Security | `helmet`, `express-rate-limit` |
| Logging | `winston` |
| Configuration | `dotenv` |
| Testing | Postman |

## Project structure

```
.
├── src/
│   ├── server.js                  # Entry point: connect to MongoDB, start the server
│   ├── app.js                     # Express app: middleware, routes, 404, error handler
│   ├── config/
│   │   ├── env.js                 # Loads and checks environment variables
│   │   ├── db.js                  # MongoDB connection (database: comp3123_assignment1)
│   │   └── logger.js              # Winston logger (console + log files)
│   ├── routes/
│   │   ├── userRoutes.js          # /api/v1/user
│   │   └── employeeRoutes.js      # /api/v1/emp
│   ├── controllers/               # HTTP layer: read request, call service, send response
│   │   ├── userController.js
│   │   └── employeeController.js
│   ├── services/                  # Data access layer (all MongoDB queries)
│   │   ├── userService.js
│   │   └── employeeService.js
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js
│   │   └── Employee.js
│   ├── validators/                # express-validator rules
│   │   ├── userValidator.js
│   │   └── employeeValidator.js
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── validate.js            # Turns validation errors into 400 responses
│   │   ├── rateLimiter.js         # Signup, login and general API limits
│   │   ├── requestLogger.js       # One log entry per request
│   │   └── errorHandler.js        # Central error handler
│   └── utils/
│       └── AppError.js            # Error with an HTTP status
├── postman/
│   └── COMP3123_Assignment1.postman_collection.json
├── logs/
│   └── sample.log                 # Example log output (real logs are git-ignored)
├── .env.example
├── .gitignore
└── package.json
```

A request flows through the layers like this:

```
route → rate limiter → auth middleware → validator → controller → service → MongoDB
                                                                     ↓
                                    error handler ← (any thrown error)
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Student#_COMP3123_Assignment1.git
cd Student#_COMP3123_Assignment1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` and set your own values (see [Configuration](#configuration)). Use a long random `JWT_SECRET`, for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Start MongoDB

Use either a local MongoDB server or MongoDB Atlas.

- **Local:** start `mongod` (default `mongodb://localhost:27017`).
- **Atlas:** create a cluster and database user, then put the connection string in `MONGODB_URI`.

The database is always named `comp3123_assignment1`, whatever database name is in the URI.

### 5. Start the application

```bash
npm run dev     # development, restarts on file changes (nodemon)
npm start       # plain node
```

You should see:

```
info: MongoDB connected: <host>/comp3123_assignment1
info: Server listening on port 3000
```

If MongoDB cannot be reached, the error is logged and the process exits with code 1.

### 6. Test the API

Open `http://localhost:3000/health`, then import the Postman collection (see [Testing with Postman](#testing-with-postman)).

## Configuration

All configuration comes from environment variables, loaded from `.env`. The real `.env` is git-ignored and must never be committed. `.env.example` contains safe placeholder values.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | – | MongoDB connection string |
| `JWT_SECRET` | Yes | – | Secret used to sign and verify JWTs |
| `JWT_EXPIRES_IN` | No | `1h` | Token lifetime (e.g. `15m`, `1h`, `1d`) |
| `PORT` | No | `3000` | HTTP port |

The server refuses to start if `MONGODB_URI` or `JWT_SECRET` is missing.

## API

Base paths: `/api/v1/user` and `/api/v1/emp`. All request and response bodies are JSON.

| # | Method | Endpoint | Auth | Success | Purpose |
| - | --- | --- | --- | --- | --- |
| 1 | POST | `/api/v1/user/signup` | No | 201 | Register a new user |
| 2 | POST | `/api/v1/user/login` | No | 200 | Log in with username or email, returns a JWT |
| 3 | GET | `/api/v1/emp/employees` | Yes | 200 | List the logged-in user's employees |
| 4 | POST | `/api/v1/emp/employees` | Yes | 201 | Create an employee owned by the logged-in user |
| 5 | GET | `/api/v1/emp/employees/{eid}` | Yes | 200 | Get one of the user's employees |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | Yes | 200 | Update one of the user's employees |
| 7 | DELETE | `/api/v1/emp/employees?eid={eid}` | Yes | 204 | Delete one of the user's employees |
| – | GET | `/health` | No | 200 | Health check |

### 1. Signup

`POST /api/v1/user/signup`

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Password123"
}
```

Rules: username 3–30 characters (letters, numbers, underscore); valid email; password 8–128 characters with at least one letter and one number. Username and email must be unique.

**201 Created**

```json
{
  "status": true,
  "message": "User created successfully.",
  "user_id": "6712f0c2a1b2c3d4e5f60718"
}
```

Errors: `400` validation failed, `409` username or email already exists, `429` too many signup attempts.

### 2. Login

`POST /api/v1/user/login` with **either** username or email:

```json
{ "username": "alice", "password": "Password123" }
```

```json
{ "email": "alice@example.com", "password": "Password123" }
```

**200 OK**

```json
{
  "status": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Errors: `400` missing credentials, `401` invalid username/email or password, `429` too many failed logins.

### 3. List employees

`GET /api/v1/emp/employees` (only the logged-in user's employees, newest first)

**200 OK**

```json
{
  "status": true,
  "count": 1,
  "employees": [
    {
      "_id": "6712f1d9a1b2c3d4e5f60720",
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "jane.doe@example.com",
      "position": "Developer",
      "salary": 75000,
      "date_of_joining": "2025-09-01T00:00:00.000Z",
      "department": "Engineering",
      "user": "6712f0c2a1b2c3d4e5f60718",
      "created_at": "2026-10-18T10:00:00.000Z",
      "updated_at": "2026-10-18T10:00:00.000Z"
    }
  ]
}
```

### 4. Create employee

`POST /api/v1/emp/employees`

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@example.com",
  "position": "Developer",
  "salary": 75000,
  "date_of_joining": "2025-09-01",
  "department": "Engineering"
}
```

All fields are required. `salary` must be a positive number, `date_of_joining` a valid date (`YYYY-MM-DD`). The owner (`user`) is **not** accepted from the body; it is always taken from the JWT.

**201 Created**: `{ "status": true, "message": "Employee created successfully.", "employee": { ... } }`

### 5. Get employee by id

`GET /api/v1/emp/employees/{eid}`

**200 OK**: `{ "status": true, "employee": { ... } }`

Errors: `400` invalid id, `403` belongs to another user, `404` not found.

### 6. Update employee

`PUT /api/v1/emp/employees/{eid}`. Send one or more fields (same rules as create):

```json
{ "position": "Senior Developer", "salary": 90000 }
```

**200 OK**: `{ "status": true, "message": "Employee details updated successfully.", "employee": { ... } }`

Unknown fields (including `user`) are ignored. Errors: `400` invalid id or body, `403`, `404`.

### 7. Delete employee

`DELETE /api/v1/emp/employees?eid={eid}`

**204 No Content** (empty body). Errors: `400` missing or invalid `eid`, `403`, `404`.

## Authentication

1. **Signup.** The user registers. The password is hashed with bcrypt before it is saved.
2. **Login.** The user sends username or email plus password. The server finds the user and compares the password with the stored hash. On success it returns a signed JWT.
3. **JWT.** The token is signed with `JWT_SECRET` using HS256 and expires after `JWT_EXPIRES_IN` (default 1 hour). Its payload holds only the user's id and username, never the password.
4. **Authorization header.** The client sends the token on every employee request:

   ```
   Authorization: Bearer <jwt>
   ```

5. **Protected endpoints.** All `/api/v1/emp/*` routes go through `authMiddleware`, which:
   - rejects a missing header → `401 Access denied. Token missing.`
   - rejects a header that is not `Bearer <token>` → `401`
   - verifies the signature (HS256 only) and expiry
   - rejects an expired token → `401 Token expired. Please log in again.`
   - rejects an invalid or tampered token → `401 Invalid token.`
   - otherwise sets `req.user` to the token payload

Login returns the same message for an unknown user and a wrong password, so the API does not reveal which usernames exist.

## Authorization (employee ownership)

The `Employee` model has a required `user` field that references the `User` who created it:

```js
user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
```

Ownership is enforced on the server in three ways:

1. **The owner always comes from the verified JWT** (`req.user.id`), never from the request body, URL or query. On create, any `user` value in the body is ignored. On update, `user` can never be changed.
2. **Every database query filters by both the employee id and the owner:**

   ```js
   Employee.find({ user: userId });                      // list
   Employee.findOne({ _id: eid, user: userId });         // get
   Employee.findOneAndUpdate({ _id: eid, user: userId }, updates);  // update
   Employee.deleteOne({ _id: eid, user: userId });       // delete
   ```

   Changing the `eid` in the URL or query string cannot reach another user's employee, because the query only ever matches the caller's own employees.
3. **Clear status codes.** When the owner-scoped query finds nothing, the service checks whether the employee exists at all:
   - exists but belongs to someone else → **403 Forbidden** (and an authorization failure is logged)
   - does not exist → **404 Not Found**

The Postman folder **"5. Ownership – cross-user access"** proves this with two users: User A cannot read, update or delete User B's employee, and the reverse. Afterwards both employees are still intact.

## Security

| Feature | How it is used |
| --- | --- |
| **Password hashing** | bcrypt (10 salt rounds) in a Mongoose `pre("save")` hook. Plain-text passwords are never stored. The password is removed from every JSON response (`toJSON`) and is never logged. |
| **JWT** | Signed with a secret from the environment, HS256 only, with an expiry. Required for all employee endpoints. |
| **Helmet** | Sets HTTP security headers, e.g. `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy`, and removes `X-Powered-By`. This protects against clickjacking, MIME sniffing, some XSS, and hides the server technology. |
| **Rate limiting** | See below. |
| **Input validation** | `express-validator` on every body, URL parameter and query value: required fields, types (strings only, which blocks NoSQL operator payloads like `{"$ne": null}`), lengths, email format, positive salary, ISO dates, valid MongoDB ObjectIds. Only validated fields reach the database. Mongoose schema rules act as a second layer. |
| **Request size** | JSON bodies are limited to 10 KB (larger → `413`). |
| **Environment variables** | Secrets live only in `.env`, which is git-ignored. `.env.example` has placeholders. The app refuses to start without `MONGODB_URI` and `JWT_SECRET`. |
| **Safe errors** | Unexpected errors return a generic `500 Internal Server Error`. Stack traces and database details are only written to the log. |

### Rate limiting

**What it is:** rate limiting caps how many requests one client (IP address) can make in a time window. It slows down brute-force password guessing, mass account creation and simple denial-of-service attempts.

**Which endpoints are protected:**

| Limiter | Applies to | Limit | Counts |
| --- | --- | --- | --- |
| `signupLimiter` | `POST /api/v1/user/signup` | 10 per 15 min per IP | every request |
| `loginLimiter` | `POST /api/v1/user/login` | 10 per 15 min per IP | only **failed** logins (successful logins are not counted) |
| `apiLimiter` | everything under `/api` | 100 per 15 min per IP | every request |

**When the limit is exceeded:** the server answers **429 Too Many Requests** with a JSON message, and logs a warning. Responses include standard `RateLimit` and `RateLimit-Policy` headers so clients can see how many requests are left.

```json
{
  "status": false,
  "message": "Too many signup attempts. Please try again after 15 minutes."
}
```

**Test result:** sending 11 signup requests in a row from the same IP returned `400` (validation) for the first 10, and the 11th returned `429` with the message above. The log recorded:

```json
{"level":"warn","message":"Rate limit exceeded: ::1 on POST /api/v1/user/signup","timestamp":"2026-10-18T00:12:55.318Z"}
```

The Postman request **"8. Rate limiting → Login brute force until 429"** repeats a wrong-password login and passes when the server returns `429` after the 10th failed attempt. Counters are kept in memory, so restarting the server resets them.

## Error handling and status codes

All errors go through one central handler (`middlewares/errorHandler.js`) and use the same JSON shape:

```json
{ "status": false, "message": "Employee not found." }
```

Validation errors also list the failing fields (submitted values are never echoed back, because they may contain passwords):

```json
{
  "status": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "salary", "message": "Salary must be a positive number" }
  ]
}
```

| Code | When it is used | Why |
| --- | --- | --- |
| 200 OK | Login, get, list, update | Request succeeded and the body contains the result |
| 201 Created | Signup, create employee | A new resource was created |
| 204 No Content | Delete employee | Succeeded, nothing to return |
| 400 Bad Request | Validation failure, invalid ObjectId, malformed JSON, empty update | The client sent invalid input |
| 401 Unauthorized | Missing, malformed, invalid or expired JWT; wrong login credentials | The client is not authenticated |
| 403 Forbidden | Employee belongs to another user | Authenticated, but not allowed to access this resource |
| 404 Not Found | Employee does not exist; unknown route | The resource or route does not exist |
| 409 Conflict | Username or email already registered | Conflicts with existing data |
| 413 Payload Too Large | JSON body over 10 KB | Request body too large |
| 429 Too Many Requests | Rate limit exceeded | Client sent too many requests |
| 500 Internal Server Error | Unexpected server or database error | Server fault; details are logged, not returned |

## Logging

Logging uses **winston** and writes to:

| Destination | Content |
| --- | --- |
| Console | Readable, coloured lines |
| `logs/app.log` | Everything (info, warn, error), one JSON object per line |
| `logs/error.log` | Errors only |

The `logs/` folder is created automatically. Real log files are git-ignored; [`logs/sample.log`](logs/sample.log) is a real example output kept in the repository.

**What is logged** (every entry has a timestamp and level):

- Server startup, MongoDB connect / disconnect / reconnect
- Every HTTP request: method, path, response status, duration, client IP
- Authentication: successful signups and logins, failed login attempts, missing / invalid / expired tokens
- Successful operations: employee created, updated, deleted (with employee and user id)
- Validation failures
- Authorization failures (user tried to access another user's employee)
- Rate limit exceeded
- Errors, with stack traces for unexpected ones

Example entries:

```json
{"duration_ms":3,"ip":"::1","level":"info","message":"HTTP request","method":"GET","path":"/health","status":200,"timestamp":"2026-10-18T00:12:55.047Z"}
{"level":"warn","message":"Authentication failure: Expired token on /api/v1/emp/employees/64b000000000000000000001","timestamp":"2026-10-18T00:12:55.116Z"}
```

**What is intentionally NOT logged:** passwords, password hashes, JWTs or `Authorization` headers, `JWT_SECRET`, database credentials or `MONGODB_URI`, and request bodies.

## Health check

`GET /health` (no authentication, not rate limited)

**200 OK**

```json
{
  "status": "ok",
  "uptime": 152.83,
  "timestamp": "2026-10-18T10:00:00.000Z",
  "database": "connected"
}
```

- `status`: `"ok"` whenever the server is running
- `uptime`: seconds since the process started
- `database`: live MongoDB connection state: `connected`, `connecting`, `disconnecting` or `disconnected`

## Testing with Postman

The collection is in [`postman/COMP3123_Assignment1.postman_collection.json`](postman/COMP3123_Assignment1.postman_collection.json). It has 46 requests, each with automatic tests.

1. Start MongoDB and the server (`npm run dev`).
2. In Postman: **Import** → select the collection file.
3. If your server is not on port 3000, change the `baseUrl` collection variable.
4. Right-click the collection → **Run collection** → **Run**. Keep the default order.

Each run creates two new users (User A and User B) with a unique suffix, so it can be run repeatedly. Tokens and employee ids are saved to collection variables automatically.

| Folder | What it tests |
| --- | --- |
| 0. Health | Server and database are up |
| 1. Signup | Valid signup (×2), duplicate username, duplicate email, invalid email, invalid password, missing fields |
| 2. Login | Login by username, login by email, invalid credentials, missing credentials |
| 3. Employees – User A | Create, list, get, update, delete; missing fields, invalid email / salary / date, missing JWT, invalid id, non-existing employee |
| 4. Employees – User B | User B creates an employee and sees only their own |
| 5. Ownership – cross-user access | A → B and B → A get / update / delete are all rejected with 403; data is unchanged afterwards |
| 6. JWT errors | No token, malformed header, invalid token, tampered token |
| 7. Other errors | Unknown route (404), malformed JSON (400) |
| 8. Rate limiting (run last) | Repeated wrong-password logins until `429` |

> **Restart the server before running the collection again.** Folder 8 locks login for 15 minutes on purpose.

To see the "Token expired" message, set `JWT_EXPIRES_IN=10s` in `.env`, restart, log in, wait 10 seconds and call any employee endpoint.

## Sample credentials

These are non-sensitive test accounts for marking. Create them with the signup endpoint (or just run the Postman collection, which creates its own users with the same passwords):

| User | Username | Email | Password |
| --- | --- | --- | --- |
| User A | `userA_demo` | `usera_demo@example.com` | `PasswordA123` |
| User B | `userB_demo` | `userb_demo@example.com` | `PasswordB123` |
