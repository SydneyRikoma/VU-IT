import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Bell, HelpCircle, LogOut, Search, Settings, UserRound } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { ReporterPortal } from "@/components/ReporterPortal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isPrivileged, useRole } from "@/lib/roles";

export function AppShell({
  moduleTitle,
  search,
  onSearchChange,
  children,
}: {
  moduleTitle?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { session, ready, signOut } = useRole();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/login", replace: true });
  }, [ready, session, navigate]);

  if (!session) return null;

  const privileged = isPrivileged(session.role);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-topbar text-topbar-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              VU
            </span>
            <span className="truncate text-sm font-bold tracking-tight sm:text-base">
              VU IT INFRASTRUCTURES
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground sm:text-sm">
              <UserRound className="size-4 text-primary" />
              <span className="max-w-[8rem] truncate">{session.name}</span>
              <span className="text-muted-foreground">· {session.role}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex">
              <Bell className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Settings" className="hidden sm:inline-flex">
              <Settings className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Help" className="hidden md:inline-flex">
              <HelpCircle className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-topbar/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          {moduleTitle ? (
            <Link
              to="/"
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Modules</span>
            </Link>
          ) : null}
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              readOnly={!onSearchChange}
              placeholder="Search Module"
              aria-label="Search Module"
              className="h-11 rounded-full border-border bg-card pl-10 shadow-sm"
            />
          </div>
        </div>
        {moduleTitle ? (
          <div className="mx-auto max-w-7xl px-4 pb-4 text-sm text-muted-foreground sm:px-6">
            <Link to="/" className="font-medium text-primary hover:underline">
              Modules
            </Link>
            <span className="px-2">/</span>
            <span className="font-semibold text-foreground">{moduleTitle}</span>
          </div>
        ) : null}
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {privileged ? children : <ReporterPortal />}
      </main>
    </div>
  );
}
