import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, ClipboardCheck, TicketCheck, Video } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VU IT Infrastructures — University Operations Portal" },
      {
        name: "description",
        content:
          "Campus operations portal for asset management, ticket dispatch, CCTV surveillance and audit compliance.",
      },
      { property: "og:title", content: "VU IT Infrastructures" },
      {
        property: "og:description",
        content:
          "Four-module campus operations portal: assets, tickets and dispatch, CCTV surveillance, audit and compliance.",
      },
    ],
  }),
  component: Index,
});

const MODULES = [
  { title: "Asset Management", to: "/assets", icon: Boxes },
  { title: "Ticket & Dispatch", to: "/tickets", icon: TicketCheck },
  { title: "CCTV Surveillance", to: "/cctv", icon: Video },
  { title: "Audit & Compliance", to: "/audit", icon: ClipboardCheck },
] as const;

function Index() {
  const [search, setSearch] = useState("");
  const visible = useMemo(
    () => MODULES.filter((m) => m.title.toLowerCase().includes(search.trim().toLowerCase())),
    [search],
  );

  return (
    <AppShell search={search} onSearchChange={setSearch}>
      <h1 className="sr-only">VU IT Infrastructures modules</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
          >
            <h2 className="text-center text-base font-bold tracking-tight">{m.title}</h2>
            <div className="icon-orb grid size-24 place-items-center rounded-full">
              <m.icon className="size-10 text-primary" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No module matches “{search}”.
        </p>
      ) : null}
    </AppShell>
  );
}
