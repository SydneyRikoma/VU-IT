import { createFileRoute } from "@tanstack/react-router";
import { Gauge, Plus, PlusCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit & Compliance — VU IT Infrastructures" },
      {
        name: "description",
        content:
          "NAAC criteria four metrics and NBA department-wise lab uptime compliance records.",
      },
      { property: "og:title", content: "Audit & Compliance — VU IT Infrastructures" },
      {
        property: "og:description",
        content: "NAAC analytics and NBA compliance engines for campus audit readiness.",
      },
    ],
  }),
  component: AuditPage,
});

type Row = Record<string, string>;

const METRIC_FIELDS = ["Metric Name", "Value %"];
const NBA_COLS = ["Department", "Lab", "Uptime %", "Last Audited"];

function Ring({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <article className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5">
      <div
        className="grid size-24 place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--primary) ${pct * 3.6}deg, var(--secondary) 0deg)`,
        }}
      >
        <div className="grid size-[4.5rem] place-items-center rounded-full bg-card text-sm font-bold">
          {pct}%
        </div>
      </div>
      <p className="text-center text-sm font-semibold">{label}</p>
    </article>
  );
}

function FormDialog({
  title,
  fields,
  onSubmit,
  triggerLabel,
  variant = "default",
  disabled,
}: {
  title: string;
  fields: string[];
  onSubmit: (row: Row) => void;
  triggerLabel: string;
  variant?: "default" | "outline";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Row>({});
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} disabled={disabled}>
          <Plus className="size-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
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
          {fields.map((f) => (
            <div key={f} className="grid gap-2">
              <Label htmlFor={f}>{f}</Label>
              <Input
                id={f}
                value={values[f] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
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

function AuditPage() {
  const { can } = useRole();
  const allowed = can("manageAudit");
  const [metrics, setMetrics] = useState<Row[]>([]);
  const [records, setRecords] = useState<Row[]>([]);

  return (
    <AppShell moduleTitle="Audit & Compliance">
      <div className="space-y-6">
        <SectionCard
          title="NAAC Analytics Engine"
          description="Criteria Four Metrics."
          action={
            <FormDialog
              title="Add Metric Data"
              triggerLabel="Add Metric Data"
              fields={METRIC_FIELDS}
              disabled={!allowed}
              onSubmit={(row) => setMetrics((m) => [...m, row])}
            />
          }
        >
          {metrics.length === 0 ? (
            <EmptyState
              icon={Gauge}
              message="No criteria four metric data captured yet."
              action={
                <FormDialog
                  title="Add Metric Data"
                  triggerLabel="Add Metric Data"
                  variant="outline"
                  fields={METRIC_FIELDS}
                  disabled={!allowed}
                  onSubmit={(row) => setMetrics((m) => [...m, row])}
                />
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((m, i) => (
                <Ring
                  key={i}
                  label={m["Metric Name"] || "Untitled metric"}
                  value={Number(m["Value %"]) || 0}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="NBA Compliance Engine"
          description="Department-wise lab uptime."
          action={
            <FormDialog
              title="Add Compliance Record"
              triggerLabel="Add Compliance Record"
              fields={NBA_COLS}
              disabled={!allowed}
              onSubmit={(row) => setRecords((r) => [...r, row])}
            />
          }
        >
          {records.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              message="No compliance records added yet."
              action={
                <FormDialog
                  title="Add Compliance Record"
                  triggerLabel="Add Compliance Record"
                  variant="outline"
                  fields={NBA_COLS}
                  disabled={!allowed}
                  onSubmit={(row) => setRecords((r) => [...r, row])}
                />
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {NBA_COLS.map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((row, i) => (
                    <TableRow key={i}>
                      {NBA_COLS.map((c) => (
                        <TableCell key={c}>{row[c] || "—"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>

        <button
          type="button"
          disabled={!allowed}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center transition-all hover:-translate-y-0.5 hover:shadow-card disabled:opacity-60"
        >
          <div className="icon-orb grid size-16 place-items-center rounded-full">
            <PlusCircle className="size-7 text-primary" strokeWidth={1.75} />
          </div>
          <span className="text-base font-bold">+ Add Compliance Engine</span>
          <span className="text-sm text-muted-foreground">
            Additional compliance engines will be added here later.
          </span>
        </button>
      </div>
    </AppShell>
  );
}
