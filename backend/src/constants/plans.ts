// Feature keys gate whole modules; limits are checked by checkPlanLimit later.
export const FEATURES = {
  DONORS: "donors",
  RECEIPTS_80G: "receipts_80g",
  CAMPAIGNS: "campaigns",
  PROJECTS: "projects",
  BENEFICIARIES: "beneficiaries",
  VOLUNTEERS: "volunteers",
  EVENTS: "events",
  FINANCE: "finance",
  GRANTS: "grants",
  HR: "hr",
  PAYROLL: "payroll",
  INVENTORY: "inventory",
  BRANCHES: "branches",
  PUBLIC_PAGE: "public_page",
  API_ACCESS: "api_access",
} as const;

export const DEFAULT_PLAN_CODE = "free";

const F = FEATURES;

// prices in paise; -1 = unlimited
export const DEFAULT_PLANS = [
  {
    code: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    trialDays: 14,
    sortOrder: 1,
    features: [F.DONORS, F.RECEIPTS_80G, F.PROJECTS],
    limits: { users: 2, donors: 100, projects: 3, storageMb: 500 },
  },
  {
    code: "growth",
    name: "Growth",
    priceMonthly: 99900,
    priceYearly: 999000,
    trialDays: 14,
    sortOrder: 2,
    features: [F.DONORS, F.RECEIPTS_80G, F.CAMPAIGNS, F.PROJECTS, F.BENEFICIARIES, F.VOLUNTEERS, F.EVENTS, F.FINANCE, F.PUBLIC_PAGE],
    limits: { users: 10, donors: 5000, projects: 50, storageMb: 5000 },
  },
  {
    code: "scale",
    name: "Scale",
    priceMonthly: 299900,
    priceYearly: 2999000,
    trialDays: 14,
    sortOrder: 3,
    features: Object.values(F).filter((f) => f !== F.API_ACCESS),
    limits: { users: 50, donors: 50000, projects: -1, storageMb: 50000 },
  },
  {
    code: "enterprise",
    name: "Enterprise",
    priceMonthly: 0,
    priceYearly: 0,
    trialDays: 30,
    sortOrder: 4,
    features: Object.values(F),
    limits: { users: -1, donors: -1, projects: -1, storageMb: -1 },
  },
];
