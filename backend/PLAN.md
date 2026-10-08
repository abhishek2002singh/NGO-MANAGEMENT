# NGO Management SaaS – Build Plan & Data Models

Stack: Express 5 · TypeScript · Prisma 7 (PostgreSQL) · Zod · React 19 + Vite + Tailwind

See also: [FEATURES.md](FEATURES.md) (what to build) · [workflow.md](workflow.md) (architecture)

---

## 1. Core SaaS principles

| Decision | Choice | Why |
|---|---|---|
| Tenancy | **One shared database, `organizationId` on every business table** | Cheapest and simplest; scales to thousands of NGOs. Add Postgres Row-Level Security later as a second safety layer. |
| Identity | `User` = global login; `OrganizationMember` = user ↔ org + role | One person can be in several NGOs; your own staff are members of the PLATFORM org. |
| Authorization | Code checks permission strings like `donation:create`, never role names | NGOs can create custom roles without code changes. |
| Plan gating | Plan has `features[]` + `limits{}`; middleware checks them on every request | Locks features after expiry and enforces usage limits. |
| IDs | `cuid()` / `uuid` strings, not autoincrement | Safe to expose in URLs; tenants can't guess each other's IDs. |
| Money | `Decimal(12,2)` + `currency` | Never use floats for money. |
| Deletes | `deletedAt` (soft delete) on business data | Audits need history. |
| Every table | `id, organizationId, createdAt, updatedAt, createdById, deletedAt` | Consistent auditing. |

---

## 2. Data models by domain

### A. Identity & Auth (global, not per tenant)
| Model | Data it holds |
|---|---|
| **User** | email, phone, passwordHash, name, avatar, emailVerifiedAt, phoneVerifiedAt, twoFactorSecret, twoFactorEnabled, lastLoginAt, status (ACTIVE/LOCKED) |
| **Session / RefreshToken** | userId, tokenHash, userAgent, ip, expiresAt, revokedAt |
| **OtpCode** | target (email/phone), codeHash, purpose (VERIFY/RESET/LOGIN), expiresAt, attempts |
| **LoginHistory** | userId, ip, device, success, reason, createdAt |

### B. Tenancy & Access
| Model | Data it holds |
|---|---|
| **Organization** | type (PLATFORM/NGO), name, slug, logo, email, phone, address, registrationNo, PAN, 12A/80G/FCRA numbers, bankDetails, status (PENDING/ACTIVE/SUSPENDED/REJECTED), verifiedAt, settings JSON (receipt format, timezone, currency, language) |
| **OrganizationMember** | userId, organizationId, roleId, departmentId, branchId?, status (INVITED/ACTIVE/DISABLED), joinedAt |
| **Role** | organizationId (null = system template), name, isSystem, permissions `String[]` |
| **Invitation** | organizationId, email, roleId, tokenHash, expiresAt, acceptedAt |
| **Department** | organizationId, name |
| **Branch** | organizationId, name, address, managerMemberId |
| **MemberScope** (optional) | memberId, projectId/branchId (limits which data the member can see) |
| **PortalAccess** | userId, organizationId, type (DONOR/VOLUNTEER/BENEFICIARY/AUDITOR), linkedEntityId |

### C. Subscription & Billing (platform level)
| Model | Data it holds |
|---|---|
| **Plan** | name, code, priceMonthly, priceYearly, trialDays, features `String[]` (module keys), limits JSON (`{users:10, storageMb:5000, donors:2000}`), isActive |
| **Subscription** | organizationId, planId, status (TRIAL/ACTIVE/PAST_DUE/EXPIRED/CANCELLED), billingCycle, currentPeriodStart/End, trialEndsAt, autoRenew, gatewaySubscriptionId |
| **Invoice** | organizationId, subscriptionId, number, amount, tax (GST), total, status, dueDate, paidAt, pdfUrl |
| **Payment** | organizationId, invoiceId?, gateway (Razorpay/Stripe), gatewayPaymentId, amount, status, refundedAmount, raw JSON |
| **UsageCounter** | organizationId, metric (users/storage/smsSent), value, period |
| **OrgModuleOverride** | organizationId, moduleKey, enabled (super admin turns modules on or off for one NGO) |
| **Coupon** (later) | code, discount, validity |

### D. Platform Operations
| Model | Data it holds |
|---|---|
| **VerificationDocument** | organizationId, type (REG_CERT/12A/80G/PAN/FCRA), fileId, status, reviewedById, remarks, expiresAt |
| **SupportTicket / TicketMessage** | organizationId, subject, priority, status, assignedToId / ticketId, authorId, body, attachments |
| **Announcement** | title, body, audience (ALL/plan/selected orgIds), channels, publishedAt |
| **PlatformSetting** | key, value JSON (gateway keys stored encrypted, branding, terms) |
| **AuditLog** | organizationId, actorUserId, action, entityType, entityId, before/after JSON, ip, createdAt |

### E. Donors & Fundraising (per tenant)
| Model | Data it holds |
|---|---|
| **Donor** | type (INDIVIDUAL/CORPORATE/CSR), name, email, phone, PAN, address, tags, totalDonated (cached) |
| **Campaign** | title, slug, goalAmount, raisedAmount, startDate, endDate, projectId?, coverImage, isPublic |
| **Donation** | donorId, campaignId?, projectId?, fundId?, amount, mode (ONLINE/CASH/CHEQUE/UPI/BANK), reference, paymentId?, status, donatedAt |
| **RecurringDonation** | donorId, amount, frequency, nextChargeAt, gatewayMandateId, status |
| **Receipt** | donationId, receiptNo (sequence per org per year), is80G, pdfUrl, emailedAt |

### F. Programs
| Model | Data it holds |
|---|---|
| **Project** | name, code, description, budget, startDate, endDate, location, status, branchId, managerId |
| **ProjectMember** | projectId, memberId / volunteerId, role |
| **Task / Milestone** | projectId, title, assigneeId, dueDate, status, progress% |
| **ProjectUpdate** | projectId, note, attachments (fileIds), createdAt |
| **FundAllocation** | projectId, fundId/grantId, amount |

### G. Beneficiaries
| Model | Data it holds |
|---|---|
| **BeneficiaryCategory** | name (Education, Health, Women…) |
| **Beneficiary** | code, name, gender, dob, phone, address, aadhaarMasked, categoryId, householdSize, income, status |
| **AidDistribution** | beneficiaryId, projectId, type (cash/kind), itemId?, quantity, value, distributedAt, distributedById |
| **ImpactRecord** | beneficiaryId/projectId, indicator, value, measuredAt |

### H. Volunteers & Events
| Model | Data it holds |
|---|---|
| **Volunteer** | userId?, name, phone, email, skills `String[]`, availability JSON, status (PENDING/APPROVED) |
| **VolunteerAssignment** | volunteerId, projectId/eventId/taskId |
| **VolunteerHours** | volunteerId, date, hours, approvedById |
| **Certificate** | volunteerId, template, pdfUrl, issuedAt |
| **Event** | title, type, venue, startAt, endAt, capacity, isPublic |
| **EventRegistration** | eventId, name/contact or donorId/volunteerId, attended |

### I. Finance & Grants
| Model | Data it holds |
|---|---|
| **Fund** | name, type (GENERAL/RESTRICTED/FCRA), balance |
| **Account / Ledger** | name, type (BANK/CASH), accountNo, openingBalance |
| **Transaction** | type (INCOME/EXPENSE/TRANSFER), accountId, fundId, projectId?, categoryId, amount, date, reference, attachmentId, sourceType/sourceId (donation, payroll) |
| **ExpenseCategory** | name, parentId |
| **Budget / BudgetLine** | projectId/fundId, period, categoryId, plannedAmount |
| **GrantAgency** | name, contact, type |
| **Grant** | agencyId, title, amount, status (PROPOSAL/SANCTIONED/ACTIVE/CLOSED), startDate, endDate, fundId |
| **ComplianceDeadline** | grantId?/docType, title, dueDate, status, reminderDays |

### J. HR & Inventory
| Model | Data it holds |
|---|---|
| **Employee** | memberId?, code, designation, departmentId, joinDate, salary, bankDetails |
| **Attendance / LeaveRequest** | employeeId, date, status / from, to, type, approval |
| **PayrollRun / Payslip** | month, status / employeeId, gross, deductions, net |
| **InventoryItem** | name, unit, category, reorderLevel, currentStock |
| **StockMovement** | itemId, type (IN/OUT/ADJUST), quantity, reference (aidDistributionId), date |
| **Asset** | name, tag, purchaseDate, value, location, assignedToId |

### K. Shared / Cross-cutting
| Model | Data it holds |
|---|---|
| **File** | organizationId, key (S3/R2 path), name, mime, size (counts toward storage limit), entityType, entityId |
| **Document** | organizationId, type, fileId, expiresAt (registration/FCRA/80G reminders) |
| **Notification** | userId, organizationId, title, body, link, readAt |
| **MessageTemplate** | organizationId, channel (EMAIL/SMS/WHATSAPP), key, subject, body |
| **MessageLog** | channel, to, templateId, status, providerId |
| **Counter** | organizationId, key (receipt/invoice/beneficiary), year, value (gap-free numbering) |

---

## 3. Backend folder structure

```
src/
  config/        env, database, redis
  middleware/    auth, tenant (resolves org from header/subdomain), requirePermission,
                 requireFeature (plan check), checkLimit, validate (zod), audit
  modules/
    auth/  users/  organizations/  members/  roles/
    plans/  subscriptions/  billing/  webhooks/
    donors/  donations/  campaigns/  receipts/
    projects/  beneficiaries/  volunteers/  events/
    finance/  grants/  hr/  inventory/
    files/  notifications/  reports/  audit/  platform-admin/
      each: *.routes.ts  *.controller.ts  *.service.ts  *.validation.ts (zod)
  jobs/          BullMQ workers: emails, receipt PDFs, renewals, expiry reminders
  lib/           pdf, mailer, sms, payment gateway, storage
```

**Request pipeline:**
`auth → tenant → requireFeature('donations') → requirePermission('donation:create') → validate → controller → service (always passes organizationId)`

Add a Prisma client extension that injects `organizationId` into every query automatically, so one forgotten filter can't leak another NGO's data.

---

## 4. Build order (phases)

1. **Foundation:** auth (JWT access + refresh token, OTP, password reset), User/Organization/Member/Role/Invitation, tenant and permission middleware, AuditLog, seed system roles and the PLATFORM org.
2. **SaaS core:** Plan, Subscription, trial on signup, Razorpay/Stripe checkout + webhooks, Invoice/Payment, feature/limit middleware, expiry cron job, super admin NGO approval and verification documents.
3. **NGO MVP:** org profile/settings, staff management, Donors, Donations, 80G Receipts (PDF + email), Projects, dashboard.
4. **Programs:** Beneficiaries, Aid distribution, Volunteers, Events.
5. **Finance:** Funds, Accounts, Transactions, Budgets, Grants, compliance reminders.
6. **Ops:** HR, Inventory, Communication (email/SMS/WhatsApp), Notifications.
7. **Growth:** reports/exports, public NGO page + donate widget, recurring donations, support tickets, announcements, 2FA, multi-language, mobile API.

---

## 5. Frontend (`ui/`)

- Add React Router, TanStack Query, react-hook-form + zod, shadcn/ui.
- Three layouts: **Platform Admin**, **NGO App**, **Public / Portal**.
- Hide menu items using the member's permissions plus the plan's features, returned from `/me`.

---

## 6. Infrastructure

| Need | Tool |
|---|---|
| Cache, rate limiting, queues | Redis + BullMQ |
| File storage | S3 / Cloudflare R2 |
| Email | Resend / AWS SES |
| SMS / WhatsApp | MSG91 / Twilio |
| Payments | Razorpay (India: UPI, 80G) or Stripe |
| Deploy | Docker + CI pipeline |

---

## 7. Next step

Replace the placeholder `User` model in `prisma/schema/` with the Phase 1 + Phase 2 models (Identity, Tenancy, Billing: about 15 models), then build the auth module and the tenant/permission middleware.
