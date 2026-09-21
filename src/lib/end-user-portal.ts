import type { Role } from "./roles";

export type EndUserRoleProfile = {
  role: Exclude<Role, "Admin" | "CISO" | "HOD" | "Technical Assistant">;
  title: string;
  subtitle: string;
};

export const END_USER_ROLE_PROFILES: EndUserRoleProfile[] = [
  {
    role: "Faculty",
    title: "Faculty portal",
    subtitle: "Submit teaching and classroom requests, track their progress, and stay updated on service delivery.",
  },
  {
    role: "Teaching Staff",
    title: "Teaching staff portal",
    subtitle: "Log classroom and learning support requests with clear status updates and assigned follow-up.",
  },
  {
    role: "Non-Teaching Staff",
    title: "Non-teaching staff portal",
    subtitle: "Report operational issues, coordinate support, and monitor request progress without leaving the portal.",
  },
  {
    role: "Student",
    title: "Student portal",
    subtitle: "",
  },
  {
    role: "Department",
    title: "Department portal",
    subtitle: "Coordinate departmental requests, review service progress, and stay informed across all support activities.",
  },
] as const;

export const END_USER_REQUEST_STATUS_STEPS = ["Submitted", "In Progress", "Completed"] as const;

export function canRequestAssets(role: Role): boolean {
  return role === "Faculty" || role === "Department";
}

export function getTicketProgressIndex(ticket: {
  technician?: string | null;
  statusIndex?: number;
}): 0 | 1 | 2 {
  if (typeof ticket.statusIndex === "number") {
    if (ticket.statusIndex >= 2) return 2;
    if (ticket.statusIndex === 1 || Boolean(ticket.technician)) return 1;
    return 0;
  }

  return Boolean(ticket.technician) ? 1 : 0;
}

export function getEndUserRoleProfile(role: Role): EndUserRoleProfile {
  const profile = END_USER_ROLE_PROFILES.find((entry) => entry.role === role);

  if (profile) return profile;

  return END_USER_ROLE_PROFILES[3];
}
