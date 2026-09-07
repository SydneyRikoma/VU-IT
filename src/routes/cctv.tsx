import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Cctv, FileText, Plus, Radar } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/cctv")({
  head: () => ({
    meta: [
      { title: "CCTV Surveillance — VU IT Infrastructures" },
      {
        name: "description",
        content:
          "Monitor camera node health, log surveillance incidents and generate week-wise CCTV reports.",
      },
      { property: "og:title", content: "CCTV Surveillance — VU IT Infrastructures" },
      {
        property: "og:description",
        content: "Node health monitor, incident entry and week-wise CCTV reporting.",
      },
    ],
  }),
  component: CctvPage,
});

type Camera = { id: string; location: string; status: "online" | "offline" | "unknown" };
type Incident = Record<string, string>;
type Report = { week: string; range: string };

const INCIDENT_COLS = ["Incident ID", "Camera/Location", "Type", "Reported By", "Timestamp", "Status"];

function CctvPage() {
  const { can } = useRole();
  const allowed = can("manageCctv");
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertOnDown, setAlertOnDown] = useState(false);
  const [week, setWeek] = useState("Week 33");
  const [report, setReport] = useState<Report | null>(null);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentValues, setIncidentValues] = useState<Incident>({});
  const [sweeping, setSweeping] = useState(false);

  const runSweep = () => {
    setSweeping(true);
    setTimeout(() => setSweeping(false), 900);
  };

  return (
    <AppShell moduleTitle="CCTV Surveillance">
      <div className="space-y-6">
        <SectionCard
          title="Node Health Monitor"
          description="Reachability status for registered camera nodes."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={runSweep} disabled={!allowed || sweeping}>
                <Radar className={`size-4 ${sweeping ? "animate-spin" : ""}`} />
                {sweeping ? "Pinging…" : "Run Ping Sweep"}
              </Button>
              <div className="flex items-center gap-2">
                <Switch
                  id="node-down-alert"
                  checked={alertOnDown}
                  onCheckedChange={setAlertOnDown}
                  disabled={!allowed}
                />
                <Label htmlFor="node-down-alert" className="text-sm">
                  WhatsApp Notification Alert on Node Down
                </Label>
              </div>
            </div>
          }
        >
          {cameras.length === 0 ? (
            <EmptyState
              icon={Cctv}
              title="No cameras registered."
              message="Register camera nodes to begin health monitoring."
              action={
                <Button
                  variant="outline"
                  disabled={!allowed}
                  onClick={() =>
                    setCameras((c) => [
                      ...c,
                      { id: `CAM-${c.length + 1}`, location: "", status: "unknown" },
                    ])
                  }
                >
                  <Plus className="size-4" /> Register Camera Node
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cameras.map((cam) => (
                <article key={cam.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">{cam.id}</p>
                    <span
                      aria-label={cam.status}
                      className={`size-3 rounded-full ${
                        cam.status === "online"
                          ? "bg-success"
                          : cam.status === "offline"
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cam.location || "Location not set"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Incident Trigger and Entry"
          description="Surveillance incidents logged against camera nodes."
          action={
            <Dialog open={incidentOpen} onOpenChange={setIncidentOpen}>
              <DialogTrigger asChild>
                <Button disabled={!allowed}>
                  <Plus className="size-4" /> Log Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Incident</DialogTitle>
                </DialogHeader>
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIncidents((r) => [...r, incidentValues]);
                    setIncidentValues({});
                    setIncidentOpen(false);
                  }}
                >
                  {INCIDENT_COLS.map((f) => (
                    <div key={f} className="grid gap-2">
                      <Label htmlFor={f}>{f}</Label>
                      <Input
                        id={f}
                        value={incidentValues[f] ?? ""}
                        onChange={(e) =>
                          setIncidentValues((v) => ({ ...v, [f]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <DialogFooter className="sm:col-span-2">
                    <Button type="submit">Save Incident</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          }
        >
          {incidents.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              message="No incidents logged yet."
              action={
                <Button variant="outline" disabled={!allowed} onClick={() => setIncidentOpen(true)}>
                  <Plus className="size-4" /> Log Incident
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {INCIDENT_COLS.map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((row, i) => (
                    <TableRow key={i}>
                      {INCIDENT_COLS.map((c) => (
                        <TableCell key={c}>{row[c] || "—"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Week-Wise CCTV Report Generation"
          description="Select a week and generate its surveillance report."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Select value={week} onValueChange={setWeek}>
                <SelectTrigger className="w-36" aria-label="Select week">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Week 33", "Week 32", "Week 31", "Week 30"].map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!allowed}
                onClick={() => setReport({ week, range: "Selected reporting period" })}
              >
                <FileText className="size-4" /> Generate Report
              </Button>
            </div>
          }
        >
          {!report ? (
            <EmptyState
              icon={FileText}
              title="No report generated yet"
              message="Pick a week and generate a report to see it here."
            />
          ) : (
            <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card p-5">
              <div className="min-w-0">
                <p className="truncate font-bold">CCTV Report — {report.week}</p>
                <p className="text-sm text-muted-foreground">{report.range}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Download report">
                <FileText className="size-4 text-primary" />
              </Button>
            </article>
          )}
        </SectionCard>

        {!allowed ? (
          <p className="text-sm text-muted-foreground">
            Surveillance actions are limited to CISO, Admin and Technical Assistant roles.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
