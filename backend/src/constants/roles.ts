import { PERMISSIONS as P } from "./permissions";

type RoleScope = "PLATFORM" | "TENANT" | "PORTAL";

export interface SystemRole {
  key: string;
  name: string;
  scope: RoleScope;
  permissions: string[];
}

export const ROLE_KEYS = {
  SUPER_ADMIN: "super_admin",
  NGO_OWNER: "ngo_owner",
} as const;

const readOnlyTenant = [
  P.ORG.READ, P.DONOR.READ, P.DONATION.READ, P.RECEIPT.READ, P.CAMPAIGN.READ, P.PROJECT.READ,
  P.BENEFICIARY.READ, P.VOLUNTEER.READ, P.EVENT.READ, P.FINANCE.READ, P.GRANT.READ, P.REPORT.READ,
];

export const SYSTEM_ROLES: SystemRole[] = [
  // ----- platform -----
  { key: ROLE_KEYS.SUPER_ADMIN, name: "Super Admin", scope: "PLATFORM", permissions: [P.ALL] },
  { key: "platform_admin", name: "Platform Admin", scope: "PLATFORM", permissions: ["platform:*", "member:*", "role:*"] },
  { key: "director", name: "Director", scope: "PLATFORM", permissions: [P.PLATFORM.DASHBOARD, P.PLATFORM.NGO_READ, P.PLATFORM.BILLING_READ] },
  {
    key: "finance",
    name: "Finance",
    scope: "PLATFORM",
    permissions: [P.PLATFORM.DASHBOARD, P.PLATFORM.NGO_READ, P.PLATFORM.BILLING_READ, P.PLATFORM.SUBSCRIPTION_MANAGE],
  },
  { key: "account_manager", name: "Account Manager", scope: "PLATFORM", permissions: [P.PLATFORM.NGO_READ, P.PLATFORM.SUPPORT] },
  { key: "support_agent", name: "Support Agent", scope: "PLATFORM", permissions: [P.PLATFORM.NGO_READ, P.PLATFORM.SUPPORT] },
  { key: "sales", name: "Sales", scope: "PLATFORM", permissions: [P.PLATFORM.NGO_READ, P.PLATFORM.DASHBOARD] },
  { key: "compliance_officer", name: "Compliance Officer", scope: "PLATFORM", permissions: [P.PLATFORM.NGO_READ, P.PLATFORM.NGO_MANAGE, P.PLATFORM.AUDIT_READ] },

  // ----- tenant -----
  { key: ROLE_KEYS.NGO_OWNER, name: "Owner", scope: "TENANT", permissions: [P.ALL] },
  {
    key: "ngo_admin",
    name: "Admin",
    scope: "TENANT",
    // everything except billing management
    permissions: [
      "org:*", "member:*", "role:*", "department:*", "branch:*", P.BILLING.READ, P.AUDIT.READ,
      "donor:*", "donation:*", "receipt:*", "campaign:*", "project:*", "beneficiary:*", "volunteer:*",
      "event:*", "finance:*", "grant:*", "employee:*", "payroll:*", "inventory:*", "report:*",
    ],
  },
  {
    key: "program_manager",
    name: "Program Manager",
    scope: "TENANT",
    permissions: [P.ORG.READ, "project:*", "beneficiary:*", "volunteer:*", "event:*", "inventory:*", P.REPORT.READ],
  },
  {
    key: "accountant",
    name: "Accountant",
    scope: "TENANT",
    permissions: [P.ORG.READ, "finance:*", "donation:*", "receipt:*", P.DONOR.READ, P.GRANT.READ, "report:*", P.PAYROLL.READ],
  },
  {
    key: "fundraiser",
    name: "Fundraiser",
    scope: "TENANT",
    permissions: [P.ORG.READ, "donor:*", "campaign:*", P.DONATION.READ, P.DONATION.CREATE, P.RECEIPT.READ, P.REPORT.READ],
  },
  { key: "volunteer_coordinator", name: "Volunteer Coordinator", scope: "TENANT", permissions: [P.ORG.READ, "volunteer:*", "event:*"] },
  { key: "hr_manager", name: "HR Manager", scope: "TENANT", permissions: [P.ORG.READ, "employee:*", "payroll:*", P.DEPARTMENT.READ] },
  {
    key: "field_staff",
    name: "Field Staff",
    scope: "TENANT",
    permissions: [P.PROJECT.READ, P.BENEFICIARY.READ, P.BENEFICIARY.CREATE, P.BENEFICIARY.UPDATE, P.EVENT.READ],
  },
  { key: "viewer", name: "Viewer / Trustee", scope: "TENANT", permissions: readOnlyTenant },
  { key: "auditor", name: "Auditor (CA)", scope: "TENANT", permissions: [P.ORG.READ, P.FINANCE.READ, P.DONATION.READ, P.RECEIPT.READ, "report:*", P.AUDIT.READ] },

  // ----- portal -----
  { key: "donor", name: "Donor", scope: "PORTAL", permissions: [] },
  { key: "volunteer", name: "Volunteer", scope: "PORTAL", permissions: [] },
  { key: "beneficiary", name: "Beneficiary", scope: "PORTAL", permissions: [] },
  { key: "csr_partner", name: "CSR Partner", scope: "PORTAL", permissions: [] },
];
