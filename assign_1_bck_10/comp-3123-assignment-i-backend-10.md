# COMP 3123 Assignment – I Backend (10%)

## COMP 3123 — Assignment 1 (Backend, 10%)

**Due:** Sunday, October 18, 2026 at 11:59 PM (Week 06)\
**Late Policy:** No late submissions.

***

### 1. Goal

Build a secure **RESTful backend API** using **Node.js, Express, and MongoDB**.

The application must provide:

* User registration and authentication
* JWT-based authorization
* Employee CRUD operations
* User-to-employee database relationships
* Access control so users can only view and manage employees they created
* Input validation
* Password hashing
* HTTP security protections
* Rate limiting
* Security headers using Helmet
* Application logging
* Health-check endpoint
* Proper HTTP status codes and error handling

You are expected to demonstrate that you understand how to design, implement, test, and document a secure REST API.

***

## 2. Technology Requirements

You must use the following technologies:

#### Backend

* Node.js
* Express.js
* REST API
* JavaScript or TypeScript

#### Database

* MongoDB
* Mongoose

**Database name:**

`comp3123_assignment1`

#### Authentication & Security

Your application must include:

* JWT authentication
* Password hashing using a suitable password-hashing library such as bcrypt
* Helmet
* Rate limiting
* Input validation
* Authorization middleware
* Secure handling of environment variables

#### Logging

Implement local application logging.

Your application should generate useful logs for events such as:

* Server startup
* API requests
* Authentication attempts
* Successful operations
* Validation failures
* Authorization failures
* Errors

Logs should be stored locally in a log file or local logging directory.

#### Version Control

Use Git throughout development.

Create a public GitHub repository named:

`Student#_COMP3123_Assignment1`

Replace `Student#` with your student number.

Commit your work regularly. Do not make one single commit immediately before submission.

***

## 3. Application Requirements

Your application will contain two main resources:

1. **Users**
2. **Employees**

The application must establish a database relationship between users and employees.

Each employee must belong to the user who created the employee.

For example:

```
User
  |
  +---- Employee
  |
  +---- Employee
  |
  +---- Employee
```

A user must **not** be able to access employees belonging to another user.

***

## 4. User Data Model

Create a User model containing appropriate fields such as:

```json
_{
  "_id": "ObjectId",
  "username": "String",
  "email": "String",
  "password": "String",      // must be hashed
  "created_at": "Date",
  "updated_at": "Date"
}
```

Requirements:

* Username must be unique.
* Email must be unique.
* Email must have a valid format.
* Password must satisfy reasonable password validation requirements.
* Password must never be stored as plain text.
* Password must be hashed before being stored in MongoDB.
* Appropriate timestamps should be maintained.

Do not return the user's hashed password in API responses.

***

## 5. Employee Data Model

Create an Employee model containing appropriate fields such as:

```json
{
  "_id": "ObjectId",
  "first_name": "String",
  "last_name": "String",
  "email": "String",
  "position": "String",
  "salary": "Number",
  "date_of_joining": "Date",
  "department": "String",
  "user": "ObjectId" //Refer to User
  "created_at": "Date",
  "updated_at": "Date"
}
```

The `user` field must represent the relationship between an employee and the user who created that employee.

The relationship should allow the application to determine:

> "Which user owns this employee?"

Requirements:

* An employee must have an owner.
* The owner must reference an existing user.
* Employees created by one user must not automatically become visible to other users.
* Employee ownership must be enforced at the API level.

***

## 6. Required API Endpoints

Use the following base paths:

```
/api/v1/user
/api/v1/emp
```

### User APIs

| # | Method | Endpoint              | Status | Purpose             |
| - | ------ | --------------------- | ------ | ------------------- |
| 1 | POST   | `/api/v1/user/signup` | 201    | Register a new user |
| 2 | POST   | `/api/v1/user/login`  | 200    | Authenticate a user |

Login must support:

* Username + password, **or**
* Email + password

Successful login must return a JWT.

***

### Employee APIs

| # | Method | Endpoint                        | Status | Purpose                                            |
| - | ------ | ------------------------------- | ------ | -------------------------------------------------- |
| 3 | GET    | `/api/v1/emp/employees`         | 200    | Get employees owned by the authenticated user      |
| 4 | POST   | `/api/v1/emp/employees`         | 201    | Create an employee for the authenticated user      |
| 5 | GET    | `/api/v1/emp/employees/{eid}`   | 200    | Get an employee owned by the authenticated user    |
| 6 | PUT    | `/api/v1/emp/employees/{eid}`   | 200    | Update an employee owned by the authenticated user |
| 7 | DELETE | `/api/v1/emp/employees?eid=xxx` | 204    | Delete an employee owned by the authenticated user |

Use the exact success status codes specified above.

***

## 7. JWT Authentication

Employee APIs must require authentication.

The expected authentication flow is:

```
Signup
   ↓
Login
   ↓
JWT generated
   ↓
Client sends JWT
   ↓
Authentication middleware
   ↓
Identify authenticated user
   ↓
Authorization / ownership check
   ↓
Employee operation
```

Clients should send the token using:

```
Authorization: Bearer <jwt>
```

Your implementation must:

* Verify the JWT.
* Reject missing tokens.
* Reject invalid tokens.
* Reject expired tokens where applicable.
* Identify the authenticated user from the token.
* Prevent unauthenticated access to protected employee endpoints.
* Never trust a user ID supplied by the client when determining employee ownership.

The employee owner should be determined from the authenticated user's identity.

***

## 8. Employee Authorization and Database Relationship

This is a **required security feature**.

A logged-in user must only be able to see and manage employees that they created.

#### Example

Suppose:

```
User A
  ├── Employee 1
  └── Employee 2

User B
  ├── Employee 3
  └── Employee 4
```

When User A requests:

```
GET /api/v1/emp/employees
```

the response must contain:

```
Employee 1
Employee 2
```

It must **not** contain:

```
Employee 3
Employee 4
```

Similarly, User A must not be able to:

* Retrieve User B's employee
* Modify User B's employee
* Delete User B's employee

You must enforce ownership in your database queries and/or authorization logic.

Do not rely only on checking the employee ID.

#### Important Security Requirement

A user should not be able to bypass authorization by changing:

```
eid
```

in the URL or query string.

Test your application using two different users and demonstrate that cross-user access is rejected.

***

## 9. Input Validation

All incoming user-controlled data must be validated.

You may use a validation library such as:

* express-validator
* Joi
* Zod
* Another appropriate validation library

Validate appropriate fields including:

#### User

* Username
* Email
* Password

#### Employee

* First name
* Last name
* Email
* Position
* Salary
* Date of joining
* Department
* Employee ID

Validation should include appropriate checks such as:

* Required fields
* String length
* Email format
* Numeric salary
* Positive salary where appropriate
* Valid dates
* Valid MongoDB ObjectId values
* Reasonable input lengths
* Invalid or unexpected input

Validation errors must return an appropriate HTTP status and useful JSON error information.

***

## 10. Security Requirements

Your API must implement basic web/API security protections.

### 10.1 Helmet

Use **Helmet** to add appropriate HTTP security headers.

You should understand what security problem Helmet helps address.

***

### 10.2 Rate Limiting

Implement API rate limiting.

At minimum, rate limiting must protect authentication endpoints such as:

```
POST /api/v1/user/login
POST /api/v1/user/signup
```

You should also consider applying appropriate rate limits to general API traffic.

Your README must explain:

* What rate limiting is
* Which endpoints are protected
* What happens when the limit is exceeded

Test the rate limiter and document the result.

***

### 10.3 Password Security

Passwords must:

* Never be stored in plain text
* Be hashed before database storage
* Never be returned in API responses

Do not commit passwords, JWT secrets, database credentials, or other secrets to GitHub.

***

### 10.4 Environment Variables

Sensitive configuration must be stored using environment variables.

Examples include:

```
MONGODB_URI
JWT_SECRET
PORT
```

Provide a safe example configuration file such as:

```
.env.example
```

Do not commit the actual `.env` file containing secrets.

***

### 10.5 Request Validation

Do not assume that client input is trustworthy.

Validate and sanitize appropriate input before processing it.

Your API should handle:

* Missing fields
* Invalid fields
* Invalid IDs
* Malformed JSON
* Invalid credentials
* Unauthorized requests
* Invalid employee ownership

***

## 11. Error Handling

Implement centralized and consistent error handling.

Your API should return JSON responses for errors.

Examples of situations that must be handled:

* User already exists
* Invalid login credentials
* Missing JWT
* Invalid JWT
* Expired JWT
* Invalid employee ID
* Employee does not exist
* Employee belongs to another user
* Invalid request body
* Database errors
* Unsupported routes
* Unexpected server errors

Do not expose sensitive implementation details, passwords, JWT secrets, database credentials, or unnecessary stack traces in production-style API responses.

***

## 12. HTTP Status Codes

Use appropriate HTTP status codes.

At minimum, demonstrate appropriate use of:

```
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
```

You should be able to explain why each status code is used.

***

## 13. Health Check Endpoint

Create a health-check endpoint that can be used to determine whether the API is running.

For example:

```
GET /health
```

The endpoint should return a successful JSON response when the application is running.

Your health-check design should provide enough information for someone testing the application to determine that the server is operational.

You may optionally include database connectivity information in the health check.

***

## 14. Local Log Collection

Your application must collect logs locally.

Logs should include useful information such as:

* Timestamp
* HTTP method
* Request path
* Response status
* Authentication-related events
* Validation failures
* Authorization failures
* Application errors

Do not log sensitive information such as:

* Passwords
* JWT secrets
* Database passwords
* Full authentication tokens

Include your log files or an appropriate example/log directory structure as required by your instructor.

If your `.gitignore` excludes generated logs, include a sample log file or demonstrate the logging functionality through screenshots.

***

## 15. REST API Design

Follow REST principles where appropriate.

Use:

* HTTP methods correctly
* Resource-oriented URLs
* JSON request and response bodies
* Appropriate status codes
* Consistent error responses

Use Express Router and organize your project into logical modules.

A recommended organization is:

```
routes
controllers
models
middleware
services
validators
config
utils
logs
```

You are responsible for determining the final project structure.

***

## 16. Sample API Requests

You must create and test requests for:

#### Signup

```
POST /api/v1/user/signup
```

Test:

* Valid signup
* Duplicate username
* Duplicate email
* Invalid email
* Invalid password
* Missing required fields

#### Login

```
POST /api/v1/user/login
```

Test:

* Valid username/password
* Valid email/password
* Invalid credentials
* Missing credentials
* Rate-limit behavior

#### Employee Creation

```
POST /api/v1/emp/employees
```

Test:

* Valid employee
* Missing fields
* Invalid email
* Invalid salary
* Invalid date
* Missing JWT

#### Employee Access

Test:

```
GET /api/v1/emp/employees
GET /api/v1/emp/employees/{eid}
PUT /api/v1/emp/employees/{eid}
DELETE /api/v1/emp/employees?eid=xxx
```

You must test both authorized and unauthorized scenarios.

***

## 17. Required Security Test Scenario

Create **at least two users** for testing.

For example:

```
User A
User B
```

Create employees for both users.

Then demonstrate:

#### User A

Can:

* See User A's employees
* Create employees
* Update User A's employees
* Delete User A's employees

#### User A attempting to access User B's employee

Must be rejected.

Repeat the test with User B attempting to access User A's employee.

Include evidence of these tests in your submission.

***

## 18. Testing Requirements

Use **Postman** or another REST API testing tool.

Test every required endpoint.

Your testing must include both:

#### Successful cases

Examples:

* Successful signup
* Successful login
* Successful employee creation
* Successful employee retrieval
* Successful employee update
* Successful employee deletion

#### Error/security cases

Examples:

* Invalid credentials
* Missing JWT
* Invalid JWT
* Invalid employee ID
* Validation failure
* Duplicate user
* Unauthorized employee access
* Rate limit exceeded
* Non-existing employee

Export your Postman collection and include it with your submission.

***

## 19. MongoDB Evidence

Your submission must demonstrate that MongoDB is being used.

Provide screenshots showing:

* Database
* Users collection
* Employees collection
* User/employee relationship
* Hashed passwords
* Employee ownership information

Do not expose real secrets in screenshots.

***

## 20. GitHub Requirements

Your repository must contain:

```
Source code
README.md
.env.example
.gitignore
Postman collection
Required configuration files
```

Do **not** commit:

```
node_modules/
.env
Passwords
JWT secrets
Database credentials
Private credentials
```

Your commit history should demonstrate regular development.

***

## 21. README Requirements

Your README must explain:

#### Project

* Application purpose
* Technologies used
* Architecture/project structure

#### Installation

Explain how to:

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Start MongoDB
5. Start the application
6. Test the API

#### Configuration

Document required environment variables without exposing actual secrets.

#### API

Document all required endpoints.

#### Authentication

Explain:

* Signup
* Login
* JWT
* Authorization header
* Protected employee endpoints

#### Authorization

Explain how your application ensures that:

> A user can only access employees belonging to that user.

#### Security

Explain your use of:

* Password hashing
* JWT
* Helmet
* Rate limiting
* Input validation
* Environment variables

#### Logging

Explain:

* Where logs are stored
* What information is logged
* What sensitive information is intentionally excluded

#### Health Check

Document the health-check URL and expected response.

***

## 22. Submission Checklist

Submit all of the following:

* [ ] GitHub repository link
* [ ] Project ZIP file
* [ ] `node_modules` removed from ZIP
* [ ] Postman collection
* [ ] README
* [ ] `.env.example`
* [ ] MongoDB screenshots
* [ ] Signup screenshots
* [ ] Login/JWT screenshots
* [ ] Employee CRUD screenshots
* [ ] Validation/error screenshots
* [ ] Rate-limiting screenshot
* [ ] Helmet/security evidence where applicable
* [ ] Health-check screenshot
* [ ] Local logging evidence
* [ ] Two-user authorization/ownership test
* [ ] Sample credentials for marking, using non-sensitive test credentials

If the API is deployed, also provide the deployed API URL.

***

## 23. Minimum Functional Requirements

To receive full consideration, the application must demonstrate all of the following:

| Requirement                     | Required |
| ------------------------------- | -------- |
| Node.js                         | Yes      |
| Express                         | Yes      |
| MongoDB                         | Yes      |
| Mongoose                        | Yes      |
| REST API                        | Yes      |
| User signup                     | Yes      |
| User login                      | Yes      |
| Password hashing                | Yes      |
| JWT authentication              | Yes      |
| Employee CRUD                   | Yes      |
| User–employee relationship      | Yes      |
| Per-user employee visibility    | Yes      |
| Per-user employee authorization | Yes      |
| Input validation                | Yes      |
| Helmet                          | Yes      |
| Rate limiting                   | Yes      |
| Error handling                  | Yes      |
| Local logging                   | Yes      |
| Health-check URL                | Yes      |
| Postman testing                 | Yes      |
| GitHub repository               | Yes      |
| README                          | Yes      |

***

## 24. Important Notes

The purpose of this assignment is to demonstrate your own understanding of backend development.

You should be able to explain your implementation during evaluation, including:

* How JWT authentication works
* How passwords are protected
* How MongoDB relationships are represented
* How employee ownership is enforced
* How validation works
* How rate limiting works
* What Helmet provides
* How errors are handled
* How logs are collected
* How the health-check endpoint works
* Why different HTTP status codes are returned

Your submitted project must be your own work and must comply with the course's academic-integrity requirements.

**Do not include secrets or real personal information in the repository or screenshots.**

***

## 25. Communication

Questions about the assignment should be sent through the course communication channel or instructor email.

**Instructor:** <pritesh.patel2@georgebrown.ca>

Please review the assignment requirements carefully before submitting.

***

## 26) Marking | 100-Point Grading Rubric

**Total: 100 points**

| Category                                    | Criteria                                                                                                                                      | Points  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **1. Project Setup & Architecture**         | Node.js + Express project setup, modular structure, Express Router, separation of routes/controllers/models/middleware/services/configuration | **8**   |
| **2. User Registration & Authentication**   | Signup endpoint, login using username/email, password hashing, duplicate-user handling, correct responses                                     | **12**  |
| **3. JWT Authentication & Authorization**   | JWT generation/verification, Bearer token handling, protected endpoints, invalid/missing/expired token handling                               | **12**  |
| **4. Employee CRUD APIs**                   | GET all, POST, GET by ID, PUT, DELETE; correct HTTP methods, JSON responses, required status codes                                            | **18**  |
| **5. Database & Relationships**             | MongoDB/Mongoose integration, User and Employee models, employee ownership relationship, timestamps, appropriate schema constraints           | **12**  |
| **6. Access Control / Data Ownership**      | Users can only see employees they created; users cannot retrieve, modify, or delete another user's employees; ownership enforced server-side  | **12**  |
| **7. Input Validation & Error Handling**    | Required-field validation, email, salary, dates, ObjectIds, malformed input, consistent error responses, centralized error handling           | **8**   |
| **8. Security: Helmet & Rate Limiting**     | Helmet implementation, authentication/API rate limiting, HTTP security protections, appropriate handling of `429 Too Many Requests`           | **6**   |
| **9. Logging & Health Check**               | Local application/request logging, useful security/error logs, no sensitive data in logs, working health-check endpoint                       | **4**   |
| **10. Testing & Postman Evidence**          | All endpoints tested, successful and failure scenarios, JWT testing, two-user ownership testing, rate-limit testing, Postman collection       | **4**   |
| **11. GitHub, README & Submission Quality** | Git history, repository organization, README, `.env.example`, `.gitignore`, screenshots, setup instructions, no secrets committed             | **4**   |
| **Total**                                   | <p><br></p>                                                                                                                                   | **100** |

***

#### Tips

* Keep commits small and frequent with meaningful messages.
* Use consistent status codes and response shapes.
* Follow the exact endpoint paths and status codes listed above.
* Name the DB **exactly** `comp3123_assignment1`.
