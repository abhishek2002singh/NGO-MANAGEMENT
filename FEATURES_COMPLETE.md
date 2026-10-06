# NGO Management SaaS – Complete Feature Specification

> Extends [FEATURES.md](FEATURES.md) with additional modules, compliance, SaaS platform capabilities and a phased roadmap.
> Phase tags: **[MVP]** = launch, **[P2]** = phase 2, **[P3]** = phase 3 / premium.

---

## 1. Super Admin (Platform Owner)

### 1.1 Dashboard [MVP]
- Total NGOs (active, trial, expired, suspended, pending verification)
- MRR / ARR, revenue this month vs last month, churn rate, ARPU
- New sign-ups trend, trial → paid conversion rate
- Storage, SMS, WhatsApp and email usage across platform
- Top NGOs by usage / revenue
- Failed payments and pending approvals widget

### 1.2 Tenant (NGO) Management [MVP]
- View, approve, reject (with reason), suspend, activate, delete (soft delete + grace period)
- NGO document verification workflow (Registration cert, 12A, 80G, PAN, FCRA, Darpan ID)
- Login as NGO admin (impersonation, audit logged, with consent toggle) [P2]
- Tenant notes / internal tags (e.g. "VIP", "high-risk")
- Tenant health score: login frequency, feature usage, payment status — churn risk alerts [P2]
- Data export of a tenant on request / on account closure

### 1.3 Subscription Plans [MVP]
- Create/edit plans: Free, Basic, Standard, Premium, Enterprise (custom)
- Monthly / quarterly / yearly billing with yearly discount
- Limits: users, beneficiaries, donors, storage, branches, projects, SMS credits
- Module-wise enablement per plan
- Add-ons: extra users, extra storage, SMS/WhatsApp credit packs, white-label, custom domain [P2]
- Plan versioning (existing customers keep old pricing — grandfathering) [P2]
- Special pricing for small/rural NGOs (verified discount)

### 1.4 Subscription Lifecycle [MVP]
- Free trial (configurable days, no card / with card)
- Approve/reject subscription requests, extend, upgrade/downgrade with proration
- Grace period after expiry, then read-only mode, then feature lock
- Auto renewal, dunning (failed payment retries + reminder emails)
- Coupon / discount codes, festival offers [P2]
- Referral program: NGO refers NGO → free month / credit [P2]
- Reseller / partner program (CA firms, consultants onboard NGOs) with commission [P3]

### 1.5 Billing & Payments [MVP]
- Payment gateways: Razorpay, Cashfree, PayU, Stripe (international)
- GST invoices (CGST/SGST/IGST), GSTIN capture, HSN/SAC codes
- Payment history, credit notes, refunds
- Offline payment entry (bank transfer / cheque) with proof upload
- Revenue reports, GST reports (GSTR-1 ready export) [P2]

### 1.6 Platform Staff & RBAC [MVP]
- Sub-admins: Support, Finance, Sales, Verification, Developer
- Roles with module-wise permissions (view/add/edit/delete/approve/export)
- IP restriction for platform staff [P2]

### 1.7 Support & Communication
- Support tickets with priority, SLA timers, assignment, internal notes [MVP]
- Canned responses, ticket categories, satisfaction rating [P2]
- Live chat widget integration [P2]
- Announcements: in-app banner, email, SMS to all / by plan / selected NGOs [MVP]
- Release notes / "What's new" panel [P2]
- Knowledge base / help center with articles & videos [P2]

### 1.8 Global Settings [MVP]
- Branding, email (SMTP/SES), SMS (MSG91/Twilio), WhatsApp (Meta Cloud API) gateways
- Payment gateway keys, terms & privacy policy, refund policy
- Default templates for new tenants (roles, receipt formats, chart of accounts)
- Feature flags (roll out features to selected NGOs) [P2]
- Maintenance mode with message

### 1.9 Audit, Security & Ops
- Audit logs for all actions (who, what, when, old/new values, IP) [MVP]
- Login history, failed login alerts [MVP]
- 2FA mandatory for platform staff [MVP]
- Automated daily backups, point-in-time restore, per-tenant restore [P2]
- System health: queue status, error logs, cron job monitor [P2]

### 1.10 Platform Reports [MVP]
- Revenue, subscriptions, NGO growth, churn, cohort retention [P2]
- Export Excel / PDF / CSV

---

## 2. Onboarding

- Sign-up with email + mobile OTP verification [MVP]
- Google sign-in [P2]
- NGO type selection: Trust / Society / Section 8 Company [MVP]
- Document upload for verification (Registration, 12A, 80G, PAN, FCRA, Darpan, CSR-1) [MVP]
- Plan selection & online payment, free trial [MVP]
- **Setup wizard**: org profile → bank accounts → financial year → add staff → import data [MVP]
- **Data import from Excel/CSV**: donors, donations, beneficiaries, volunteers, opening balances, with validation & error report [MVP]
- Sample/demo data mode to explore the app [P2]
- Onboarding checklist with progress % [P2]
- Guided product tours (tooltips) [P2]

---

## 3. NGO Admin (Organization)

- Dashboard: donations, projects, beneficiaries, volunteers, expenses, upcoming deadlines [MVP]
- Customisable dashboard widgets per role [P2]
- Organization profile: logo, address, registration numbers, bank accounts, signatory [MVP]
- Staff users & custom roles with module-wise and **branch-wise / project-wise** data access [MVP]
- Branch / location management with branch-level reports [MVP]
- Financial year settings (April–March), receipt number series per FY [MVP]
- Approval workflow builder (e.g. expense > ₹10,000 needs Director approval) [P2]
- Custom fields on donors, beneficiaries, volunteers, projects [P2]
- Subscription view, upgrade, invoices, usage meters [MVP]
- Email/SMS/WhatsApp templates, receipt & certificate designer [MVP]

---

## 4. Donor & Donation Management

### 4.1 Donors [MVP]
- Donor profiles: individual / corporate / foundation / foreign
- PAN, Aadhaar (masked), address, DOB, anniversary
- Donation history, lifetime value, last donation date
- Tags & segments (major donor, lapsed, monthly giver)
- Duplicate donor detection & merge
- Donor self-service portal: download receipts & 10BE, update PAN/address, manage recurring donation [P2]

### 4.2 Donations [MVP]
- Online: Razorpay/Cashfree/UPI/cards/netbanking, international via Stripe/PayPal (FCRA)
- Offline: cash, cheque (with clearance status), DD, bank transfer, UPI
- In-kind donations (goods) with valuation, linked to inventory
- Donation purpose: general / project / campaign / corpus / restricted fund
- Auto 80G receipt PDF + email/WhatsApp, receipt cancellation with reason
- Bulk receipts, duplicate receipt reprint
- Recurring donations via UPI AutoPay / e-NACH / card subscriptions [P2]
- Pledges & pledge tracking [P2]

### 4.3 Fundraising [P2]
- Campaign pages with goal, progress bar, donor wall, updates
- Peer-to-peer fundraising (supporters create personal pages)
- Birthday / memorial / tribute donations
- Donation QR codes (static UPI QR per campaign)
- Embeddable donate widget for any website
- Matching gift campaigns [P3]

### 4.4 Donor Engagement [P2]
- Automated thank-you, birthday, anniversary messages
- Impact updates linked to projects they funded ("Your ₹5,000 educated 2 children")
- Lapsed donor re-engagement automation
- Donor retention & RFM analysis [P3]

---

## 5. Compliance (India) — Key Differentiator

- **Form 10BD** annual statement of donations — auto generated in Income Tax portal format [MVP]
- **Form 10BE** donor certificates — bulk generate & email [MVP]
- PAN mandatory check before 80G receipt (warning / block) [MVP]
- Cash donation limit check (80G deduction not allowed above ₹2,000 cash) [MVP]
- **FCRA** [P2]
  - Separate FC receipt account (SBI NDMB) & utilisation accounts
  - Foreign contribution segregated ledger
  - Quarterly FC receipt disclosure on website
  - FC-4 annual return data
  - Admin expense limit (20%) monitor
- **CSR** compliance: CSR-1 number, MoU tracking, tranche releases, impact reports [P2]
- Registration renewal tracker: 12A / 80G (5-year), FCRA, Darpan, Shops & Establishment [MVP]
- Form 10B / 10BB audit report data pack for CA [P2]
- ITR-7 data summary [P2]
- 85% application of income tracker & accumulation (Form 10) [P2]
- TDS on payments to vendors/staff, 24Q/26Q data, TDS certificates [P3]
- Statutory registers (Trust/Society), board meeting minutes, resolutions [P2]
- **DPDP Act 2023**: consent capture, purpose limitation, data access/erase requests, minors' data protection [MVP]

---

## 6. Project / Program Management

- Projects with budget, timeline, location, donor/grant linkage [MVP]
- Assign staff & volunteers [MVP]
- Tasks, milestones, Kanban board, Gantt view [P2]
- Progress tracking with geo-tagged, time-stamped photo/video evidence [MVP]
- Project-wise fund allocation & utilization [MVP]
- **Logframe / Theory of Change**: inputs → activities → outputs → outcomes → impact [P2]
- Indicators (KPIs) with targets vs achieved [P2]
- SDG tagging (UN Sustainable Development Goals) [P2]
- Project map view (all project locations on map) [P2]
- Risk register & issue log [P3]
- Project closure report auto-generation [P2]

---

## 7. Beneficiary Management

- Registration & profile, family/household linking [MVP]
- Categories: education, health, women, elderly, disability, livelihood, disaster relief [MVP]
- Aadhaar/ID-based **de-duplication** (prevent double benefit) [MVP]
- Eligibility criteria rules per scheme [P2]
- QR code beneficiary ID cards [P2]
- Aid/benefit distribution records with OTP / thumbprint / photo acknowledgement [MVP]
- Case management: needs assessment, case notes, follow-ups, referrals [P2]
- Beneficiary documents with consent [MVP]
- Impact tracking: baseline vs endline surveys [P2]
- Government scheme linkage tracking (helped get ration card, pension, etc.) [P3]
- Sensitive-data masking by role (health, child data) [MVP]

---

## 8. Volunteer Management

- Online registration, approval, background verification status [MVP]
- Skills, interests, languages, availability calendar [MVP]
- Opportunity board: volunteers apply for tasks/events [P2]
- Event/task assignment, shift scheduling [MVP]
- Attendance via QR check-in / GPS check-in [P2]
- Hours tracking, leaderboard, badges (gamification) [P2]
- Auto certificates (participation, hours) with verification QR [MVP]
- Volunteer mobile app / portal [P2]
- Corporate volunteering (employee volunteering programs for CSR partners) [P3]

---

## 9. Event Management

- Create events (camps, drives, programs, fundraisers) [MVP]
- Public registration form, ticketing (paid/free) [P2]
- QR check-in attendance [P2]
- Event budget & expense [P2]
- Gallery, report, feedback survey [MVP]
- Calendar sync (Google/Outlook) [P2]

---

## 10. Finance & Accounts

- Chart of accounts (NGO-specific template) [MVP]
- Income & expense vouchers, journal, contra [MVP]
- Fund accounting: restricted / unrestricted / corpus / FCRA funds [MVP]
- Grant/project-wise accounting [MVP]
- Bank & cash book, **bank reconciliation** (statement import) [P2]
- Budget vs actual with variance alerts [MVP]
- Expense claims & reimbursement with bill upload, approval flow [P2]
- Petty cash & field staff advances / settlement [P2]
- Vendor management, purchase orders, payments [P2]
- Utilization certificates (UC) auto-generation [MVP]
- Receipts & Payments, Income & Expenditure, Balance Sheet [MVP]
- **Tally / Zoho Books export** (XML) [P2]
- Multi-currency for foreign grants [P3]
- Year-end closing & carry forward [P2]
- OCR bill scanning → auto expense entry [P3]

---

## 11. Grant Management

- Funder / donor agency records & contacts [MVP]
- Proposal pipeline: draft → submitted → under review → approved/rejected [MVP]
- Grant agreements, tranches, conditions [MVP]
- Grant fund utilization & budget lines [MVP]
- Reporting calendar with auto reminders [MVP]
- Funder-specific report templates [P2]
- Proposal writing library (reusable org info, past proposals) [P2]
- AI-assisted proposal drafting [P3]

---

## 12. HR / Staff Management

- Employee records, documents, contracts [MVP]
- Attendance (GPS/selfie for field staff) & leave [MVP]
- Payroll: salary structure, PF, ESI, PT, TDS, payslips [P2]
- Consultant / honorarium payments [P2]
- Timesheets & time allocation to projects (for cost allocation to grants) [P2]
- Performance appraisals [P3]
- Recruitment / job openings on public page [P3]

---

## 13. Inventory / Assets

- Stock items (food, clothes, medicine kits, books) with units [MVP]
- Multiple warehouses / branch stores [P2]
- Stock in (purchase / in-kind donation) / out (distribution) [MVP]
- Distribution linked to beneficiaries [MVP]
- Expiry date tracking (food, medicine) & low stock alerts [P2]
- Asset register with depreciation, assignment to staff, maintenance [MVP]
- Barcode/QR asset tagging [P3]

---

## 14. Communication

- Email / SMS / WhatsApp to donors, volunteers, beneficiaries, staff [MVP]
- Templates with merge fields, DLT-compliant SMS templates [MVP]
- Segments & bulk campaigns with scheduling [P2]
- Delivery & open reports [P2]
- In-app & push notifications [MVP]
- Newsletter builder (drag & drop) [P2]
- Automation workflows (trigger → wait → message) [P3]
- Internal team chat / announcements [P3]

---

## 15. Documents & Compliance Vault

- Document storage with folders, version history [MVP]
- Expiry reminders (registration, FCRA, 80G, licences, insurance) [MVP]
- E-signature for MoUs, agreements [P3]
- Annual report generator (auto pulls stats, projects, financials, photos) [P2]
- Board / governance: members, meetings, minutes, resolutions [P2]

---

## 16. Monitoring, Evaluation & Surveys [P2]

- Drag-and-drop form/survey builder (text, choice, photo, GPS, signature)
- Offline data collection on mobile
- Skip logic, validation
- Survey results dashboard & export
- Link surveys to beneficiaries / projects / indicators

---

## 17. Reports & Analytics

- Donation, project, beneficiary, finance, volunteer, HR, inventory reports [MVP]
- Dashboard charts, period comparison [MVP]
- Custom report builder (choose fields, filters, grouping) [P2]
- Scheduled reports emailed weekly/monthly [P2]
- Impact dashboard for public / funders (shareable link) [P2]
- Export Excel / PDF / CSV [MVP]

---

## 18. Public Website & Portals

- Public NGO page: about, projects, gallery, team, financials, certifications [MVP]
- Donate button, campaign pages, volunteer sign-up [MVP]
- Blog / news / success stories [P2]
- SEO settings, social sharing [P2]
- Custom domain & SSL, white-label [P3]
- Transparency page (FCRA disclosures, annual reports) [P2]
- Portals: donor portal, volunteer portal, funder portal (view grant reports) [P2]

---

## 19. Mobile Apps

- Field worker app (offline-first, sync later) [P2]
  - Beneficiary registration, distribution, surveys, geo-tagged photos, attendance
- Volunteer app: tasks, check-in, hours, certificates [P2]
- Admin app: dashboard, approvals, notifications [P3]

---

## 20. AI & Smart Features [P3]

- AI report writer (project reports, annual report narrative, donor updates)
- AI grant proposal assistant
- Donor churn prediction & next-best-donor suggestions
- Smart search across all modules (natural language)
- OCR for documents, bills, cheques
- Duplicate & fraud detection (suspicious donations, double benefits)
- Auto-translate communications to regional languages

---

## 21. Integrations

- Payment: Razorpay, Cashfree, PayU, Stripe, PayPal [MVP/P2]
- Communication: MSG91, Twilio, WhatsApp Cloud API, SES/SendGrid [MVP]
- Accounting: Tally, Zoho Books [P2]
- Google Workspace / Microsoft 365 (calendar, drive) [P2]
- Social media posting (Facebook, Instagram, LinkedIn) [P3]
- Zapier / Make, webhooks, public REST API with API keys [P2]
- Giving platforms import (GiveIndia, Ketto, Milaap donations CSV) [P2]

---

## 22. Common / Technical

### Architecture
- Multi-tenant (shared DB with `tenant_id` + row-level security, or schema-per-tenant) [MVP]
- REST/GraphQL API for web & mobile [MVP]
- Background job queue (receipts, emails, reports, imports) [MVP]
- File storage on S3-compatible storage with per-tenant quotas [MVP]
- Caching (Redis), CDN for assets [MVP]

### Security
- RBAC at platform & tenant level, field-level permissions [MVP]
- 2FA (OTP / authenticator app), password policy, session management, force logout [MVP]
- Encryption at rest & in transit, encrypted PII fields (Aadhaar, PAN, bank) [MVP]
- Rate limiting, CAPTCHA on public forms [MVP]
- SSO (Google / SAML) for enterprise [P3]
- Regular VAPT / security audits [P2]

### Reliability
- Daily backups, 30-day retention, tested restore [MVP]
- Uptime target 99.5%+, status page [P2]
- Error monitoring (Sentry), logging, alerts [MVP]

### UX
- Mobile responsive, PWA [MVP]
- Dark mode [P2]
- Multi-language: English, Hindi + regional (Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada) [P2]
- Accessibility (WCAG 2.1 AA) [P2]
- Global search, keyboard shortcuts [P2]
- Bulk actions, saved filters, column customization on lists [MVP]

### Data
- Activity / audit log at tenant level [MVP]
- Soft delete & recycle bin [MVP]
- Full data export (tenant owns their data) [MVP]
- Data retention policies [P2]

---

## 23. Suggested Plan Mapping

| Feature | Basic | Standard | Premium | Enterprise |
|---|---|---|---|---|
| Donors, donations, 80G receipts | ✅ | ✅ | ✅ | ✅ |
| 10BD / 10BE | ✅ | ✅ | ✅ | ✅ |
| Basic finance | ✅ | ✅ | ✅ | ✅ |
| Beneficiaries, projects | – | ✅ | ✅ | ✅ |
| Volunteers, events | – | ✅ | ✅ | ✅ |
| Grants, HR, inventory | – | – | ✅ | ✅ |
| FCRA, CSR modules | – | – | ✅ | ✅ |
| Mobile field app, surveys | – | – | ✅ | ✅ |
| Custom domain, white-label, API | – | – | – | ✅ |
| AI features | – | – | Add-on | ✅ |
| Users | 3 | 10 | 30 | Unlimited |
| Branches | 1 | 3 | 10 | Unlimited |

---

## 24. Roadmap Summary

- **MVP (3–4 months):** Super admin, onboarding & billing, RBAC, donors & donations, 80G + 10BD/10BE, basic finance, beneficiaries, projects, volunteers, basic reports, public page.
- **Phase 2:** FCRA, CSR, grants, HR/payroll, inventory, surveys/M&E, mobile field app, portals, Tally export, automation, multi-language.
- **Phase 3:** AI features, white-label, SSO, reseller program, advanced analytics, e-signature.
