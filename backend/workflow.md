# Backend Workflow – NGO Management SaaS

Stack: Express 5 · TypeScript · Prisma 7 (PostgreSQL, `@prisma/adapter-pg`) · Zod

This file covers two things:
1. **Architecture**: how the SaaS is designed (tenants, users, roles, permissions, billing).
2. **Next steps**: what to build next in this codebase, in order.

---

## 1. Architecture

### 1.1 The tenant model

```
                              SaaS PLATFORM
                                    │
                     Organization (type = PLATFORM)
                                    │
           ┌────────────────────────┼─────────────────────────┐
           │                        │                         │
   OrganizationMember          Plans & Billing          Platform Settings
   (your company staff)        Plan, Subscription,      Feature flags, templates,
   Roles: super_admin,         Invoice                  email/WhatsApp config
   platform_admin, finance,
   account_manager,
   support, sales
           │
           │  manages (assigned NGOs / time-limited support access)
           ▼
   ┌──────────────────────────────────────────────────────────────┐
   │              Organization (type = NGO)  ← TENANT             │
   │   subscription • limits • settings • branding • parentOrg    │
   └──────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼──────────────────────┬────────────────────┐
        ▼                     ▼                      ▼                    ▼
 OrganizationMember       Roles               Departments           Branches (optional)
 (NGO staff)         (permission bundles)   Finance, HR,
                      Owner, Admin,         Programs, Fundraising
                      Accountant, Program
                      Mgr, HR, Field Staff,
                      Viewer, Auditor + custom
        │
        ▼
 Portal access (external, limited login)
 Donor • Volunteer • Beneficiary • CSR Partner • Auditor/CA
```

**Core rules**

- **One login system for everyone.** Your company's staff are `OrganizationMember`s of the PLATFORM organization. NGO staff are members of their NGO. Platform and NGO staff use the same tables and the same code.
- **`User` is only an identity.** It never stores a role. Roles live on `OrganizationMember`, because one person can belong to more than one organization.
- **Each member has three separate dimensions:**
  - **Role**: what they can do (permissions)
  - **Department**: which team they belong to (Finance, HR, Programs)
  - **Scope**: which data they see (branch, assigned projects)
- **Permissions are written as strings** in the form `module:action`, for example `donor:read`, `donation:refund`, `payroll:run`, `member:invite`, `billing:manage`. Wildcards: `donor:*`, `*`. Code checks permissions and never checks role names.
- **Every business table has `organizationId`**, and every query is filtered by it. This keeps each NGO's data separate.

### 1.2 Default roles (seeded with `isSystem = true`; NGOs can add custom roles)

| Platform (your company) | NGO (tenant) | Portal |
|---|---|---|
| super_admin | ngo_owner (billing + all) | donor |
| platform_admin | ngo_admin | volunteer |
| director (read dashboards) | program_manager | beneficiary |
| finance (subscriptions, GST) | accountant / finance_manager | csr_partner |
| account_manager (assigned NGOs) | fundraiser | |
| support_agent (consented access) | volunteer_coordinator | |
| sales | hr_manager | |
| compliance_officer | field_staff (assigned projects only) | |
| developer / ops | viewer / trustee | |
| | auditor (CA, read-only finance) | |

### 1.3 Data models

| Model | Purpose / key fields |
|---|---|
| `User` | email, phone, passwordHash, status, emailVerified, phoneVerified, twoFactor, tokenVersion, lastLoginAt, failedLoginAttempts, lockUntil, deletedAt |
| `Organization` | type (PLATFORM / NGO), name, slug, entityType (trust / society / section8 / religious_trust), PAN, 12A, 80G, FCRA, CSR-1, Darpan, address, logo, status (trial / active / suspended / cancelled), parentOrgId, accountManagerId |
| `OrganizationMember` | userId + organizationId (unique pair), roles[], departmentId, branchId, projectAccess[], extraPermissions[], deniedPermissions[], status, invitedBy, joinedAt |
| `Role` | organizationId (null = default role), key, name, scope (PLATFORM / TENANT / PORTAL), permissions[], isSystem |
| `Department` | organizationId, name, headMemberId |
| `Branch` | organizationId, name, address |
| `Invitation` | organizationId, email/phone, roleIds, tokenHash, expiresAt, acceptedAt |
| `Session` / `RefreshToken` | userId, tokenHash, device, ip, expiresAt, revokedAt |
| `Plan` | name, price (in paise), interval, limits {donors, projects, users, storageMb}, features[] |
| `Subscription` | organizationId, planId, status (trialing / active / past_due / cancelled), currentPeriodStart / End, Razorpay ids |
| `Invoice` | subscriptionId, amount, gst, status, Razorpay ids |
| `SupportAccess` | platformMemberId, organizationId, reason, approvedBy, expiresAt |
| `AuditLog` | actorUserId, organizationId, action, entity, entityId, before, after, ip, userAgent, createdAt |
| `Notification` | organizationId, userId, channel (email / whatsapp / sms / in_app), template, status |
| `FileUpload` | organizationId, key, mime, size, uploadedBy (stored in India) |

Business modules added later (each has `organizationId`): Donor, Donation, Receipt, Campaign, Project, Fund, LedgerEntry, Voucher, ComplianceTask, Volunteer, Activity, Certificate, Employee, Payroll, Beneficiary, CsrPartner, Proposal, SupportTicket.

### 1.4 Request pipeline

```
Request
  → authenticate          JWT valid? user active? tokenVersion matches?
  → resolveTenant         x-org-id header or subdomain → load OrganizationMember (403 if none)
  → checkSubscription     org active? not expired/suspended? (expired = read-only)
  → authorize("perm")     roles' permissions + extraPermissions − deniedPermissions
  → checkPlanLimit("x")   e.g. Free plan allows 50 donors
  → applyDataScope        field staff see only their projects/branch
  → validate(zodSchema)
  → controller → service → prisma (auto-filtered by organizationId)
  → auditLog
```

### 1.5 Engineering rules

- Store money as **integers in paise**, never as floats.
- Number receipts **in order for each organization and financial year** (`HH/2026-27/00045`) using an atomic counter row.
- **Soft delete** (`deletedAt`) for anything financial or personal.
- **Encrypt** PAN, Aadhaar and bank details at the field level, and **mask** them in API responses.
- Hash invite tokens, reset tokens and refresh tokens before storing them. Never store the raw token.
- Use `uuid` / `cuid` IDs (not auto-increment `Int`), so IDs can't be guessed across tenants.
- Use the timezone `Asia/Kolkata` and the Indian financial year (April–March) in reports.

---

## 2. Current state of the codebase

| Item | Status |
|---|---|
| Express app, CORS, rate limit, 404/error handler | ✅ Done (`src/server.ts`, `src/middleware/*`) |
| Env loading (`.env.dev` / `.env.prod`) | ✅ Done (`src/config/env.ts`) |
| Prisma + Postgres connection | ✅ Done (`src/config/database.ts`) |
| Response helpers | ✅ Done (`src/utils/apiResponse.ts`) |
| Health module | ✅ Done (`src/modules/checkHealthAndBackendCondition`) |
| `User` model | ⚠️ Placeholder only (`Int` id, name, email). Needs to be replaced. |
| Auth, tenants, roles, billing | ❌ Not started |

---

## 3. Next steps (in order)

### Step 1: Foundation clean-up
1. Add an `AppError` class (`statusCode`, `message`, `code`) in `src/utils/`. Update `errorHandler` to return its status and message, handle `ZodError` → 400 and Prisma `P2002` (duplicate value) → 409, and hide stack traces in production.
2. Add `CONFLICT: 409` and `UNPROCESSABLE: 422` to `HTTP_STATUS`.
3. Add a `validate(schema)` middleware that uses Zod for body, params and query.
4. Add an `asyncHandler` helper, or rely on Express 5's built-in promise handling and keep controllers `async`.
5. Add `helmet`, plus `express.json({ limit: "1mb" })`.
6. Add a request ID and a structured logger (`pino`). Log `requestId`, `userId` and `orgId` on every line.
7. Add `"x-org-id"` to `CORS_CONFIG.ALLOWED_HEADERS`.
8. Add env vars to `env.ts`: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `ENCRYPTION_KEY`, `APP_URL`.
9. Settle the module layout: `modules/<name>/{routes, controller, service, schema(zod), types}.ts`.

### Step 2: Prisma schema (identity + tenancy)
1. Replace the placeholder `User` with the full model from §1.3, using `String @id @default(uuid())`.
2. Add `Organization`, `OrganizationMember`, `Role`, `MemberRole` (join table), `Department`, `Branch`, `Invitation`, `Session`, `AuditLog`.
3. Add enums: `OrgType`, `OrgStatus`, `UserStatus`, `MemberStatus`, `RoleScope`, `EntityType`.
4. Add indexes: `@@unique([userId, organizationId])` on member, `@@unique([organizationId, key])` on role, and `@@index([organizationId])` on every tenant table.
5. Because the `init` migration only contains the placeholder User and has no real data, **reset and create a fresh migration** (`prisma migrate reset`, then `prisma migrate dev --name identity_tenancy`).

### Step 3: Permissions as code
1. Create `src/constants/permissions.ts` with all permission strings grouped by module (`PERMISSIONS.DONOR.READ`, and so on).
2. Create `src/constants/roles.ts` with the default roles from §1.2 and their permission lists.
3. Create a seed script at `prisma/seed.ts`. It should be safe to run more than once (upsert). It creates:
   - the PLATFORM organization
   - the default system roles
   - the first super_admin user, using the email and password from env
   - default plans (Free, Growth, Scale, Enterprise)
4. Add the `"prisma:seed"` script to `package.json`.

### Step 4: Auth module (`modules/auth`)
1. Packages: `argon2` (or `bcrypt`), `jsonwebtoken`, `cookie-parser`.
2. Endpoints:
   - `POST /auth/register-ngo`: creates User + NGO Organization + OrganizationMember(ngo_owner) + trial Subscription in **one transaction**
   - `POST /auth/login`: returns an access token (15 min) and a refresh token in an httpOnly cookie (7–30 days), with an account lock after failed attempts
   - `POST /auth/refresh`: rotate the refresh token and detect reuse
   - `POST /auth/logout`, `POST /auth/logout-all` (increase `tokenVersion`)
   - `POST /auth/verify-email`, `POST /auth/forgot-password`, `POST /auth/reset-password`
   - `GET /auth/me`: user + list of memberships (organizations + roles)
   - Later: phone OTP login and 2FA (TOTP) for owner, admin and finance users
3. Middleware `authenticate`: verify the JWT, load the user, check `status` and `tokenVersion`, and set `req.user`.
4. Extend Express's `Request` type (`src/types/express.d.ts`) with `user`, `org` and `member`.

### Step 5: Tenant and authorization middleware
1. `resolveTenant`: read `x-org-id`, load the member with roles, reject if the user is not an active member, and set `req.org` and `req.member`. Cache the result in memory, or in Redis later.
2. `authorize(...perms)`: work out the member's effective permissions, support wildcards, and return 403 if a permission is missing.
3. `requirePlatform`: only PLATFORM organization members can use `/platform/*` routes.
4. **Prisma tenant extension**: `prisma.$extends` with a query hook that adds `where.organizationId` to reads and `data.organizationId` to creates for tenant models. Provide `getTenantPrisma(orgId)` and use it in services.
5. Optional (later): PostgreSQL Row-Level Security as a second layer of protection.

### Step 6: Organization and member management
1. `GET/PATCH /org`: profile, registration numbers, logo
2. `GET /org/members`, `PATCH /org/members/:id` (roles, department, scope), `DELETE` (soft delete / suspend)
3. `POST /org/invitations`: email invite with a hashed token and expiry. `POST /invitations/accept` handles both new and existing users.
4. `GET/POST/PATCH/DELETE /org/roles`: custom roles. System roles can't be deleted, and nobody can grant a permission they don't have themselves.
5. Departments and branches CRUD
6. Rule: there must always be at least one `ngo_owner`. Ownership transfer needs an explicit flow.

### Step 7: Audit log
1. An `audit(req, action, entity, before, after)` service.
2. Call it from services for create, update, delete, login, role change and permission change.
3. `GET /org/audit-logs` for NGO admins, and `GET /platform/audit-logs` for platform staff.

### Step 8: Plans, subscriptions, billing
1. Models: `Plan`, `Subscription`, `Invoice`, plus a `UsageCounter` (or count rows when needed).
2. Middleware: `checkSubscription` (expired or past due = read-only) and `checkPlanLimit(resource)`.
3. Feature check: `requireFeature("payroll")`
4. Razorpay subscriptions + webhook endpoint (verify the signature, and make sure repeated webhooks don't apply twice)
5. Trial lifecycle: 14 days → reminders → grace period → read-only

### Step 9: Platform admin module (`/platform/*`)
1. NGO list, approve, suspend, activate; view documents
2. Plan CRUD; manual subscription extend, upgrade or downgrade
3. Platform staff management (same member and role APIs, scoped to the PLATFORM org)
4. Account manager → assigned NGOs
5. Support access: request → NGO approves → time-limited and audit-logged
6. Dashboard: MRR, active NGOs, trials ending, failed payments, churn

### Step 10: Background jobs and notifications
1. `bullmq` + Redis
2. Queues: email, WhatsApp, SMS, PDF generation, compliance reminders, subscription reminders
3. `Notification` model + templates

### Step 11: Core NGO modules (main product value)
1. Donor (PAN check, duplicate detection, CSV import)
2. Donation → 80G Receipt (numbered in order, PDF, email/WhatsApp)
3. Campaigns + public donation page (Razorpay/UPI)
4. Projects + Funds (FCRA vs. domestic)

### Step 12: Finance and compliance
Ledger (double-entry), vouchers, Form 10BD export, 10BE generation, FC-4 data, compliance calendar (10B/10BB, ITR-7), CA/auditor read-only portal.

### Step 13: Operations
Beneficiaries, volunteers (activities, certificates), HR & payroll (PF / ESI / TDS), CSR partners and proposals, support tickets.

### Step 14: Differentiators
Approval workflows, grant management (budget vs. actual spend), impact/SDG dashboard + annual report, offline mobile app for field staff, donor self-service portal, WhatsApp bot, AI (proposal drafts, impact stories, predicting donors likely to stop giving), public API + webhooks with per-org API keys, multi-branch consolidated reports, white-label custom domain.

---

## 4. Quality checklist (for every module)

- [ ] Zod validation for every input
- [ ] Every query filtered by `organizationId` (tenant Prisma client)
- [ ] `authorize()` on every route, plus `checkPlanLimit` where needed
- [ ] Audit log for every write
- [ ] Pagination, sorting and filtering on list endpoints
- [ ] Soft delete for financial and personal data
- [ ] Tests: unit tests (services), integration tests (routes), and a **tenant isolation test** (NGO A can never read NGO B's data)
- [ ] Sensitive fields masked in responses

## 5. Packages to add (when you reach each step)

| Step | Packages |
|---|---|
| 1 | `helmet`, `pino`, `pino-http` |
| 4 | `argon2`, `jsonwebtoken`, `cookie-parser` (+ `@types/*`) |
| 8 | `razorpay` |
| 10 | `bullmq`, `ioredis`, `nodemailer` (or a provider SDK) |
| 11 | `pdfkit` / `puppeteer`, `csv-parse` |
| Tests | `vitest`, `supertest` |
