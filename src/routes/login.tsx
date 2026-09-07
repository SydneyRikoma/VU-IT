import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  END_USER_ROLES,
  PRIMARY_ROLES,
  requiresPassword,
  useRole,
  type Role,
} from "@/lib/roles";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — VU IT Infrastructures" },
      {
        name: "description",
        content:
          "Role-based sign in for VU IT Infrastructures: CISO, HOD, Technical Assistant, staff, faculty and students.",
      },
      { property: "og:title", content: "Sign in — VU IT Infrastructures" },
      {
        property: "og:description",
        content: "Choose your role to enter the VU IT Infrastructures operations portal.",
      },
    ],
  }),
  component: LoginPage,
});

const ALL_ROLES: Role[] = [...PRIMARY_ROLES, ...END_USER_ROLES];

function LoginPage() {
  const navigate = useNavigate();
  const { session, ready, signIn } = useRole();
  const [role, setRole] = useState<Role>("CISO");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && session) navigate({ to: "/", replace: true });
  }, [ready, session, navigate]);

  const needsPassword = requiresPassword(role);

  return (
    <div className="grid min-h-screen place-items-center bg-topbar/30 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
            VU
          </span>
          <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg">
            VU IT INFRASTRUCTURES
          </h1>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const result = signIn({ role, name, password });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setError(null);
            navigate({ to: "/", replace: true });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="login-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="login-role" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="login-username">Username</Label>
            <Input
              id="login-username"
              value={name}
              autoComplete="username"
              onChange={(e) => setName(e.target.value)}
              placeholder="Username"
            />
          </div>

          {needsPassword ? (
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full">
            <LogIn className="size-4" /> Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
