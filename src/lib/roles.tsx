import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const PRIMARY_ROLES = ["Admin", "CISO", "HOD", "Technical Assistant"] as const;
export const END_USER_ROLES = [
  "Faculty",
  "Teaching Staff",
  "Non-Teaching Staff",
  "Student",
  "Department",
] as const;

export type Role = (typeof PRIMARY_ROLES)[number] | (typeof END_USER_ROLES)[number];

const APPROVER_ROLES: Role[] = ["Admin", "HOD", "Technical Assistant"];
const MANAGER_ROLES: Role[] = ["Admin", "HOD", "Technical Assistant", "CISO"];

/** Roles that must authenticate with a username + password. */
export const PASSWORD_ROLES: Role[] = ["Admin", "CISO", "HOD", "Technical Assistant"];

export function requiresPassword(role: Role) {
  return PASSWORD_ROLES.includes(role);
}

export function isPrivileged(role: Role) {
  return PASSWORD_ROLES.includes(role);
}

/** UI-only demo credential check — replace with real auth when a backend is added. */
const DEMO_PASSWORD = "vuit2026";

export type Session = { role: Role; name: string };

type RoleContextValue = {
  session: Session | null;
  role: Role;
  ready: boolean;
  signIn: (input: { role: Role; name: string; password?: string }) =>
    | { ok: true }
    | { ok: false; error: string };
  signOut: () => void;
  can: (permission: Permission) => boolean;
};

export type Permission =
  | "raiseTicket"
  | "approve"
  | "triage"
  | "manageAssets"
  | "manageCctv"
  | "manageAudit"
  | "moveTickets";

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = "vu-it-session";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Session;
        if (parsed?.role) setSession(parsed);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = useCallback<RoleContextValue["signIn"]>(({ role, name, password }) => {
    if (!name.trim()) return { ok: false, error: "Enter your name or ID." };
    if (requiresPassword(role) && password !== DEMO_PASSWORD) {
      return { ok: false, error: "Incorrect password." };
    }
    const next: Session = { role, name: name.trim() };
    setSession(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<RoleContextValue>(() => {
    const role = session?.role ?? "Student";
    return {
      session,
      role,
      ready,
      signIn,
      signOut,
      can: (permission) => {
        if (!session) return false;
        switch (permission) {
          case "raiseTicket":
            return true;
          case "approve":
          case "triage":
          case "moveTickets":
            return APPROVER_ROLES.includes(role);
          case "manageAssets":
          case "manageAudit":
            return MANAGER_ROLES.includes(role);
          case "manageCctv":
            return role === "CISO" || role === "Admin" || role === "Technical Assistant";
          default:
            return false;
        }
      },
    };
  }, [session, ready, signIn, signOut]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
