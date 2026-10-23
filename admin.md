# Admin System Documentation

This document describes the admin system, roles, permissions, and how to use the admin dashboard.

## Table of Contents

1. [Overview](#overview)
2. [Admin User Credentials](#admin-user-credentials)
3. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
4. [Admin Dashboard](#admin-dashboard)
5. [API Endpoints](#api-endpoints)
6. [Audit Logs](#audit-logs)
7. [Seeding the Admin User](#seeding-the-admin-user)

---

## Overview

The admin system provides comprehensive system oversight with:
- **Role-based access control** with three built-in roles: ADMIN, USER, MODERATOR
- **Admin Dashboard** with real-time metrics and analytics
- **Audit Logging** to track all system activities
- **User Management** with role assignment capabilities

---

## Admin User Credentials

When you run the seed script, it creates an admin account. Set the credentials yourself before seeding — either via environment variables or by editing the fallback values in `prisma/seed.ts`:

```env
# .env
ADMIN_EMAIL="you@yourdomain.com"
ADMIN_PASSWORD="a-strong-password-of-your-choice"
```

If neither is set, the seed falls back to `admin@example.com` / `ChangeMe123!` for local testing only.

```
Email:    your email (ADMIN_EMAIL)
Password: your password (ADMIN_PASSWORD)
Role:     ADMIN
```

⚠️ **IMPORTANT**: Never commit real credentials to git, and change the password after first login!

---

## Role-Based Access Control (RBAC)

### Built-in Roles

#### 1. ADMIN
Full system access with all permissions:
- `user:read`, `user:create`, `user:update`, `user:delete`
- `content:read`, `content:create`, `content:update`, `content:delete`
- `project:read`, `project:create`, `project:update`, `project:delete`
- `schedule:read`, `schedule:create`, `schedule:update`, `schedule:delete`
- `audit:read`, `audit:delete`
- `admin:dashboard`, `admin:metrics`, `admin:settings`

#### 2. USER
Standard user with content management permissions:
- `content:read`, `content:create`, `content:update`, `content:delete`
- `project:read`, `project:create`, `project:update`, `project:delete`
- `schedule:read`, `schedule:create`, `schedule:update`, `schedule:delete`

#### 3. MODERATOR
Content moderation and user viewing permissions:
- `user:read`
- `content:read`, `content:update`, `content:delete`
- `project:read`, `schedule:read`, `audit:read`

### Database Schema

```prisma
model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  permissions String[]
  users       UserRole[]
}

model UserRole {
  id         String   @id @default(cuid())
  userId     String
  roleId     String
  assignedAt DateTime @default(now())
  assignedBy String?
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
}
```

---

## Admin Dashboard

Access the admin dashboard at `/admin`

### Features

#### 1. Overview Tab
Real-time metrics including:
- **User Statistics**: Total users, new users today/week/month, active sessions
- **Content Statistics**: Total content, content by status, content created today/week/month
- **Project Statistics**: Active projects, total projects, projects created this month
- **Schedule Statistics**: Pending schedules, total schedules, breakdown by status
- **Visual Charts**:
  - Content status distribution (pie chart)
  - Content by platform (bar chart)
- **System Health**: Active sessions, audit logs today, total audit logs

#### 2. Users Tab
User management interface:
- Search users by email or name
- View user details including:
  - Email and name
  - Assigned roles
  - Content count
  - Project count
  - Join date
- Manage user roles (coming soon)

#### 3. Content Tab
Content overview:
- Content created this week/month
- Posted and pending content counts
- Schedule status breakdown:
  - Pending
  - Active
  - Completed
  - Failed
  - Cancelled

#### 4. Audit Logs Tab
Complete audit trail:
- Timestamp
- User who performed the action
- Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)
- Entity affected
- Details of the change
- Pagination support (50 logs per page)

---

## API Endpoints

### Admin Metrics
```http
GET /api/admin/metrics
```
Returns comprehensive system metrics.

**Response:**
```json
{
  "metrics": {
    "totalUsers": 100,
    "newUsersToday": 5,
    "newUsersThisWeek": 15,
    "newUsersThisMonth": 50,
    "activeUsersToday": 25,
    "totalContent": 500,
    "contentByStatus": {
      "PENDING": 50,
      "APPROVED": 200,
      "POSTED": 230,
      "REJECTED": 20
    },
    "contentByPlatform": { ... },
    ...
  }
}
```

### Admin Users
```http
GET /api/admin/users?page=1&limit=20&search=&role=
PATCH /api/admin/users
```

**GET Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by email or name
- `role`: Filter by role name

**PATCH Body (Update Roles):**
```json
{
  "userId": "user-id",
  "roles": ["USER", "MODERATOR"]
}
```

### Admin Audit Logs
```http
GET /api/admin/audit-logs?page=1&limit=50&action=&entity=&userId=&startDate=&endDate=
POST /api/admin/audit-logs
```

**GET Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `action`: Filter by action type
- `entity`: Filter by entity type
- `userId`: Filter by user
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)

**POST Body (Create Audit Log):**
```json
{
  "action": "CUSTOM_ACTION",
  "entity": "EntityName",
  "entityId": "entity-id",
  "details": { "key": "value" },
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Admin Roles
```http
GET /api/admin/roles
POST /api/admin/roles
```

**POST Body (Create/Update Role):**
```json
{
  "name": "CUSTOM_ROLE",
  "description": "Role description",
  "permissions": ["content:read", "content:create"]
}
```

---

## Audit Logs

The audit logging system automatically tracks:

### Tracked Actions
- `CREATE` - Entity creation
- `UPDATE` - Entity updates
- `DELETE` - Entity deletion
- `LOGIN` - User login
- `LOGOUT` - User logout
- `SEED` - Database seeding
- `CRON_RUN` - Scheduled task execution
- `UPDATE_USER_ROLES` - Role assignment changes
- `CREATE_ROLE` - New role creation

### Tracked Entities
- User
- ContentItem
- Project
- Schedule
- Profile
- Role
- System

### Database Schema

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String?  // Who performed the action
  action      String   // What was done
  entity      String   // What was affected
  entityId    String?  // ID of affected entity
  details     String?  // JSON string with additional info
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  user        User?    @relation(fields: [userId], references: [id])
}
```

---

## Seeding the Admin User

### Using the Seed Script

The admin user and roles are automatically created by running:

```bash
npx tsx prisma/seed.ts
```

This script will:
1. Create the ADMIN role with full permissions
2. Create the USER role with standard permissions
3. Create the MODERATOR role with moderation permissions
4. Create or update the admin user
5. Assign the ADMIN role to the admin user
6. Create an audit log entry for the seeding

### Manual Seeding

If you need to create an admin user manually:

```typescript
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  // 1. Ensure ADMIN role exists
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Full system access',
      permissions: ['*'],
    },
  })

  // 2. Create admin user
  const hashedPassword = await bcrypt.hash('password', 12)
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  })

  // 3. Assign ADMIN role
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: adminRole.id,
    },
  })
}
```

---

## Security Considerations

1. **Admin Access**: All admin API endpoints require the `ADMIN` role
2. **Password Security**: Change default passwords immediately
3. **Audit Trail**: All admin actions are logged for accountability
4. **Role Assignment**: Only admins can assign roles to users
5. **Session Management**: Admin sessions should have appropriate timeouts

---

## Troubleshooting

### Common Issues

**1. "Forbidden - Admin access required"**
- Ensure the user has the ADMIN role assigned
- Check the roles are correctly loaded in the session

**2. Database schema errors**
- Run `npx prisma db push` to sync the schema
- Run `npx prisma generate` to update the client

**3. Missing admin user**
- Run the seed script: `npx tsx prisma/seed.ts`
- Check the database for the user record

---

## Future Enhancements

- [ ] Role editing UI
- [ ] Permission builder
- [ ] Advanced audit log filtering
- [ ] Export audit logs
- [ ] User impersonation for support
- [ ] IP-based access restrictions
- [ ] Two-factor authentication for admins
