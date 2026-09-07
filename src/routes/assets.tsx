import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  CalendarClock,
  HardDrive,
  PackagePlus,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Asset Management — VU IT Infrastructures" },
      {
        name: "description",
        content:
          "Track dead stock, current stock, faculty profiles, hardware issue and the year-wise hardware registry.",
      },
      { property: "og:title", content: "Asset Management — VU IT Infrastructures" },
      {
        property: "og:description",
        content: "Campus hardware inventory, issue records and year-wise registry.",
      },
    ],
  }),
  component: AssetsPage,
});

type Row = Record<string, string>;

const SECTIONS = [
  { id: "dead", label: "Dead Stock (Hardware)", icon: Archive },
  { id: "current", label: "Current Stock (Hardware)", icon: HardDrive },
  { id: "faculty", label: "Faculty Profiles", icon: Users },
  { id: "issue", label: "Issue of Hardware", icon: Send },
  { id: "registry", label: "Year-Wise Hardware Registry", icon: CalendarClock },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function FormDialog({
  trigger,
  title,
  fields,
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  fields: string[];
  onSubmit: (row: Row) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Row>({});

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setValues({});
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
            setValues({});
            setOpen(false);
          }}
        >
          {fields.map((field) => (
            <div key={field} className="grid gap-2">
              <Label htmlFor={field}>{field}</Label>
              <Input
                id={field}
                value={values[field] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              />
            </div>
          ))}
          <DialogFooter className="sm:col-span-2">
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell key={c}>{row[c] || "—"}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const DEAD_COLS = [
  "Component",
  "Serial No.",
  "Department",
  "Building/Floor/Lab",
  "Status",
  "Decommission Date",
];
const CURRENT_COLS = [
  "Component",
  "Serial No.",
  "Assigned To",
  "Department",
  "Building/Floor/Lab",
  "Status",
];
const ISSUE_COLS = ["Component", "Recipient", "Department", "Location", "Date"];
const REGISTRY_COLS = ["Year", "Hardware Component", "Issue No.", "Issue Name"];

function AssetsPage() {
  const { can } = useRole();
  const allowed = can("manageAssets");
  const [section, setSection] = useState<SectionId>("dead");
  const [dead, setDead] = useState<Row[]>([]);
  const [current, setCurrent] = useState<Row[]>([]);
  const [faculty, setFaculty] = useState<Row[]>([]);
  const [issues, setIssues] = useState<Row[]>([]);
  const [registry, setRegistry] = useState<Row[]>([]);
  const [filters, setFilters] = useState<Row>({});
  const [year, setYear] = useState("2026");

  const years = ["2026", "2025", "2024", "2023", "2022"];
  const filteredIssues = issues.filter((r) =>
    Object.entries(filters).every(([k, v]) => !v || (r[k] ?? "").toLowerCase().includes(v.toLowerCase())),
  );
  const yearRows = registry.filter((r) => r["Year"] === year);

  return (
    <AppShell moduleTitle="Asset Management">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav className="rounded-2xl border border-border bg-card p-2 shadow-card lg:sticky lg:top-6 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((s) => (
              <li key={s.id} className="shrink-0 lg:shrink">
                <button
                  onClick={() => setSection(s.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    section === s.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <s.icon className="size-4 shrink-0" />
                  <span className="whitespace-nowrap lg:whitespace-normal">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {section === "dead" ? (
            <SectionCard
              title="Dead Stock (Hardware)"
              description="Decommissioned hardware components."
              action={
                <FormDialog
                  title="Add Dead Stock Entry"
                  fields={DEAD_COLS}
                  onSubmit={(row) => setDead((r) => [...r, row])}
                  trigger={
                    <Button disabled={!allowed}>
                      <Plus className="size-4" /> Add Dead Stock Entry
                    </Button>
                  }
                />
              }
            >
              {dead.length === 0 ? (
                <EmptyState
                  icon={Archive}
                  message="No dead stock entries recorded yet."
                  action={
                    <FormDialog
                      title="Add Dead Stock Entry"
                      fields={DEAD_COLS}
                      onSubmit={(row) => setDead((r) => [...r, row])}
                      trigger={
                        <Button variant="outline" disabled={!allowed}>
                          <Plus className="size-4" /> Add Dead Stock Entry
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <DataTable columns={DEAD_COLS} rows={dead} />
              )}
            </SectionCard>
          ) : null}

          {section === "current" ? (
            <SectionCard
              title="Current Stock (Hardware)"
              description="Hardware currently in service across departments."
              action={
                <FormDialog
                  title="Add Stock Entry"
                  fields={CURRENT_COLS}
                  onSubmit={(row) => setCurrent((r) => [...r, row])}
                  trigger={
                    <Button disabled={!allowed}>
                      <Plus className="size-4" /> Add Stock Entry
                    </Button>
                  }
                />
              }
            >
              {current.length === 0 ? (
                <EmptyState
                  icon={HardDrive}
                  message="No stock entries recorded yet."
                  action={
                    <FormDialog
                      title="Add Stock Entry"
                      fields={CURRENT_COLS}
                      onSubmit={(row) => setCurrent((r) => [...r, row])}
                      trigger={
                        <Button variant="outline" disabled={!allowed}>
                          <Plus className="size-4" /> Add Stock Entry
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <DataTable columns={CURRENT_COLS} rows={current} />
              )}
            </SectionCard>
          ) : null}

          {section === "faculty" ? (
            <SectionCard
              title="Faculty Profiles"
              description="Faculty records with assigned asset counts."
              action={
                <FormDialog
                  title="Add Faculty Profile"
                  fields={["Name", "Department", "Assigned Assets"]}
                  onSubmit={(row) => setFaculty((r) => [...r, row])}
                  trigger={
                    <Button disabled={!allowed}>
                      <Plus className="size-4" /> Add Faculty Profile
                    </Button>
                  }
                />
              }
            >
              {faculty.length === 0 ? (
                <EmptyState
                  icon={Users}
                  message="No faculty profiles created yet."
                  action={
                    <FormDialog
                      title="Add Faculty Profile"
                      fields={["Name", "Department", "Assigned Assets"]}
                      onSubmit={(row) => setFaculty((r) => [...r, row])}
                      trigger={
                        <Button variant="outline" disabled={!allowed}>
                          <Plus className="size-4" /> Add Faculty Profile
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {faculty.map((f, i) => (
                    <article
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="icon-orb grid size-14 shrink-0 place-items-center rounded-full">
                        <Users className="size-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{f["Name"] || "Unnamed"}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {f["Department"] || "—"}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {f["Assigned Assets"] || "0"} assets
                        </Badge>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </SectionCard>
          ) : null}

          {section === "issue" ? (
            <SectionCard
              title="Issue of Hardware"
              description="Filter and record hardware issued to recipients."
              action={
                <FormDialog
                  title="Issue Hardware"
                  fields={ISSUE_COLS}
                  onSubmit={(row) => setIssues((r) => [...r, row])}
                  trigger={
                    <Button disabled={!allowed}>
                      <Plus className="size-4" /> Issue Hardware
                    </Button>
                  }
                />
              }
            >
              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {["Department", "Floor", "Building", "Lab"].map((f) => (
                  <div key={f} className="grid gap-2">
                    <Label htmlFor={`filter-${f}`}>{f}</Label>
                    <Input
                      id={`filter-${f}`}
                      placeholder={`Filter by ${f.toLowerCase()}`}
                      value={filters[f] ?? ""}
                      onChange={(e) => setFilters((v) => ({ ...v, [f]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              {filteredIssues.length === 0 ? (
                <EmptyState
                  icon={Send}
                  message="No hardware issue records yet."
                  action={
                    <FormDialog
                      title="Issue Hardware"
                      fields={ISSUE_COLS}
                      onSubmit={(row) => setIssues((r) => [...r, row])}
                      trigger={
                        <Button variant="outline" disabled={!allowed}>
                          <Plus className="size-4" /> Issue Hardware
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <DataTable columns={ISSUE_COLS} rows={filteredIssues} />
              )}
            </SectionCard>
          ) : null}

          {section === "registry" ? (
            <SectionCard
              title="Year-Wise Hardware Registry"
              description="Uniform registry format: Year | Hardware Component | Issue No. | Issue Name."
              action={
                <FormDialog
                  title="Add Registry Entry"
                  fields={REGISTRY_COLS}
                  onSubmit={(row) => setRegistry((r) => [...r, row])}
                  trigger={
                    <Button disabled={!allowed}>
                      <PackagePlus className="size-4" /> Add Registry Entry
                    </Button>
                  }
                />
              }
            >
              <div className="mb-5 w-full sm:w-56">
                <Label htmlFor="year" className="mb-2 block">
                  Registry Year
                </Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {yearRows.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  message={`No registry entries for ${year} yet.`}
                  action={
                    <FormDialog
                      title="Add Registry Entry"
                      fields={REGISTRY_COLS}
                      onSubmit={(row) => setRegistry((r) => [...r, row])}
                      trigger={
                        <Button variant="outline" disabled={!allowed}>
                          <PackagePlus className="size-4" /> Add Registry Entry
                        </Button>
                      }
                    />
                  }
                />
              ) : (
                <DataTable columns={REGISTRY_COLS} rows={yearRows} />
              )}
            </SectionCard>
          ) : null}

          {!allowed ? (
            <p className="text-sm text-muted-foreground">
              Your current role has read-only access to asset records.
            </p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
