# RBAC User Management API

A complete **Role-Based Access Control (RBAC)** system built with **Node.js**, **Express.js**, and **PostgreSQL**.

---

## 🏗️ Architecture & Folder Structure

```
rbac-project/
├── src/
│   ├── app.js                        # Express app setup (middleware, routes)
│   ├── server.js                     # Server entry point + graceful shutdown
│   ├── config/
│   │   ├── database.js               # PostgreSQL pool config
│   │   └── logger.js                 # Winston logger
│   ├── database/
│   │   ├── migrate.js                # Migration runner
│   │   ├── seed.js                   # Seed default roles, permissions, admin
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   ├── middleware/
│   │   ├── authenticate.js           # JwtAuthGuard — validates JWT, attaches req.user
│   │   ├── authorize.js              # RolesGuard — authorize('admin', 'manager')
│   │   ├── permissions.js            # PermissionsGuard — requirePermission('delete','doc')
│   │   ├── validate.js               # express-validator error formatter
│   │   └── errorHandler.js           # Global 404 + error handler
│   ├── utils/
│   │   ├── jwt.js                    # JWT generate/verify helpers
│   │   └── response.js               # Standardized API response helpers
│   └── modules/
│       ├── auth/
│       │   ├── auth.service.js       # login, refresh, logout, logoutAll
│       │   ├── auth.controller.js
│       │   ├── auth.routes.js
│       │   └── auth.validators.js
│       ├── users/
│       │   ├── users.service.js      # CRUD, changePassword, activate/deactivate
│       │   ├── users.controller.js
│       │   ├── users.routes.js
│       │   └── users.validators.js
│       ├── roles/
│       │   ├── roles.service.js      # CRUD, assignRoleToUser, getUserRoles
│       │   ├── roles.controller.js
│       │   ├── roles.routes.js
│       │   └── roles.validators.js
│       |
│       └── audit/
│           ├── audit.service.js      # log(), listLogs, getLogsForUser/Resource
│           ├── audit.controller.js
│           └── audit.routes.js
├── logs/                             # Auto-created on startup
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup

### 1. Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and secrets
```

### 4. Run database migration
```bash
npm run migrate
```

### 5. Seed default data (roles, permissions, admin user)
```bash
npm run seed
```

### 6. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 🔑 Default Credentials (after seeding)

| Field    | Value           |
|----------|-----------------|
| Email    | admin@rbac.com  |
| Password | Admin@123       |

---

## � Authentication Modes

This application supports **two authentication modes**, selectable via environment variable:

### 1. **PASSWORD Mode** (Default)
Traditional username/password authentication with bcrypt hashing.
- Users stored in database with password hashes
- Set `AUTH_MODE=PASSWORD` in `.env`

### 2. **LDAP Mode** (Enterprise)
Authenticate against LDAP directory (Active Directory, OpenLDAP, etc.).
- Users validated against external LDAP server
- Auto-create users in database on first login
- Set `AUTH_MODE=LDAP` in `.env`

#### Quick Start with Public LDAP Test Server

Test LDAP authentication without setting up your own directory:

```bash
# 1. Update .env
AUTH_MODE=LDAP
LDAP_URL=ldap://ldap.forumsys.com:389
LDAP_SEARCH_DN=uid={username},dc=example,dc=com

# 2. Restart server
npm run dev

# 3. Test with ForumSys account
# Email: newton@forumsys.com
# Password: password
```

**Available test accounts:** newton, einstein, tesla, boyle, galileo (password: `password`)

For detailed LDAP setup, configuration options, and production examples, see **[LDAP_SETUP.md](./LDAP_SETUP.md)**.

---

## �🛡️ Guard Chain

Every protected route runs guards in this order:

```
Request → JwtAuthGuard → RolesGuard → PermissionsGuard → Controller
```

- **JwtAuthGuard** (`authenticate.js`) — Validates Bearer token, attaches `req.user`. Returns `401` on failure.
- **RolesGuard** (`authorize.js`) — Checks `req.user` has one of the required roles. Returns `403` on failure.
- **PermissionsGuard** (`permissions.js`) — Checks user's combined permissions include `action:resource`. Returns `403` on failure.

---

## 📡 API Reference

Base URL: `http://localhost:3000/api/v1`

### Auth Endpoints

| Method | Route             | Auth | Description                   |
|--------|-------------------|------|-------------------------------|
| POST   | /auth/login       | —    | Login, returns JWT tokens     |
| POST   | /auth/refresh     | —    | Refresh access token (rotates)|
| POST   | /auth/logout      | JWT  | Revoke refresh token          |
| POST   | /auth/logout-all  | JWT  | Revoke all sessions           |
| GET    | /auth/me          | JWT  | Get current user profile      |

#### POST /auth/login
```json
// Request
{ "email": "admin@rbac.com", "password": "Admin@123" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": 1, "email": "admin@rbac.com", "roles": ["admin"] }
  }
}
```

#### POST /auth/refresh
```json
// Request
{ "refreshToken": "eyJ..." }
```

---

### User Endpoints

| Method | Route                      | Auth              | Description              |
|--------|----------------------------|-------------------|--------------------------|
| GET    | /users                     | JWT + admin/mgr   | List all users           |
| POST   | /users                     | JWT + admin       | Create user              |
| GET    | /users/:id                 | JWT               | Get user by ID           |
| PATCH  | /users/:id                 | JWT + admin       | Update user              |
| DELETE | /users/:id                 | JWT + admin       | Deactivate user          |
| PATCH  | /users/:id/activate        | JWT + admin       | Activate user            |
| PATCH  | /users/:id/change-password | JWT               | Change own password      |
| GET    | /users/:id/roles           | JWT + admin/mgr   | Get user's roles         |
| POST   | /users/:id/roles           | JWT + admin       | Assign role to user      |
| DELETE | /users/:id/roles/:roleId   | JWT + admin       | Remove role from user    |

#### POST /users
```json
{
  "email": "john@example.com",
  "password": "John@1234",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

### Role Endpoints

| Method | Route                          | Auth        | Description                  |
|--------|--------------------------------|-------------|------------------------------|
| GET    | /roles                         | JWT + admin | List all roles               |
| POST   | /roles                         | JWT + admin | Create role                  |
| GET    | /roles/:id                     | JWT + admin | Get role by ID               |
| PATCH  | /roles/:id                     | JWT + admin | Update role                  |
| DELETE | /roles/:id                     | JWT + admin | Delete role (non-system only)|
| GET    | /roles/:id/permissions         | JWT + admin | Get role's permissions       |
| POST   | /roles/:id/permissions         | JWT + admin | Assign permission to role    |
| DELETE | /roles/:id/permissions/:permId | JWT + admin | Remove permission from role  |

---



---

### Audit Log Endpoints

| Method | Route                                  | Auth        | Description                   |
|--------|----------------------------------------|-------------|-------------------------------|
| GET    | /audit-logs                            | JWT + admin | List all logs (filterable)    |
| GET    | /audit-logs/user/:id                   | JWT + admin | Logs for a specific user      |
| GET    | /audit-logs/resource/:resource/:id     | JWT + admin | Logs for a specific resource  |

**Query filters for GET /audit-logs:**
- `page`, `limit` — pagination
- `action` — filter by action (e.g. `login`, `create`, `delete`)
- `resource` — filter by resource (e.g. `user`, `role`)
- `userId` — filter by user
- `startDate`, `endDate` — date range (ISO 8601)

---



---

## 🔒 Security Features

- **Helmet** — sets secure HTTP headers
- **CORS** — configurable origin whitelist
- **Rate limiting** — 200 req/15min globally, 20 req/15min on auth routes
- **bcrypt** — password hashing (configurable rounds)
- **JWT rotation** — refresh tokens are rotated on each use
- **Soft deletes** — users are deactivated, not deleted
- **System roles** — `is_system_role = true` roles cannot be deleted via API
- **Input validation** — all inputs validated with express-validator
- **Audit trail** — every state-changing action is logged




