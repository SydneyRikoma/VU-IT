import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  Check,
  ImagePlus,
  Inbox,
  KanbanSquare,
  ListChecks,
  MessageSquare,
  Plus,
  TicketCheck,
  X,
} from "lucide-react";
import { useState } from "react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/lib/roles";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Ticket & Dispatch — VU IT Infrastructures" },
      {
        name: "description",
        content:
          "Raise tickets, triage with a priority matrix, run multi-tier approvals and track lifecycle status.",
      },
      { property: "og:title", content: "Ticket & Dispatch — VU IT Infrastructures" },
      {
        property: "og:description",
        content: "Call action taken workflow: raise, triage, approve, dispatch and alert.",
      },
    ],
  }),
  component: TicketsPage,
});

type Priority = "High" | "Moderate" | "Low";
type Lane = "Taken" | "In Progress" | "Completed";
type StageStatus = "pending" | "approved" | "rejected";
const STAGES = ["Raised", "Law HOD", "CSE HOD", "Tech"] as const;
type Stage = (typeof STAGES)[number];

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  location: string;
  photo: string;
  lane: Lane;
  stages: Record<Stage, StageStatus>;
  comments: string[];
};

const LANES: Lane[] = ["Taken", "In Progress", "Completed"];
const URGENCY = ["High", "Medium", "Low"] as const;
const IMPACT = ["High", "Medium", "Low"] as const;

function matrixPriority(urgency: string, impact: string): Priority {
  const score = (v: string) => (v === "High" ? 3 : v === "Medium" ? 2 : 1);
  const total = score(urgency) + score(impact);
  if (total >= 5) return "High";
  if (total >= 4) return "Moderate";
  return "Low";
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const tone =
    priority === "High"
      ? "bg-destructive text-destructive-foreground"
      : priority === "Moderate"
        ? "bg-warning text-warning-foreground"
        : "bg-success text-success-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tone}`}>{priority}</span>;
}

const TABS = [
  { id: "raise", label: "Ticket Raise", icon: Plus },
  { id: "triage", label: "Request Intake & Triage", icon: Inbox },
  { id: "approval", label: "Approval Pipeline", icon: ListChecks },
  { id: "lifecycle", label: "Lifecycle Status Tracker", icon: KanbanSquare },
  { id: "alerts", label: "Alert Notification", icon: BellRing },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TicketsPage() {
  const { role, can } = useRole();
  const [tab, setTab] = useState<TabId>("raise");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string>("Medium");
  const [impact, setImpact] = useState<string>("Medium");
  const [whatsapp, setWhatsapp] = useState(false);
  const [systemMsg, setSystemMsg] = useState(false);
  const [alertLog, setAlertLog] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Moderate" as Priority,
    location: "",
    photo: "",
  });

  const activeTicket = tickets.find((t) => t.id === selected) ?? null;

  const submitTicket = () => {
    const id = `TKT-${String(tickets.length + 1).padStart(3, "0")}`;
    setTickets((t) => [
      ...t,
      {
        id,
        ...form,
        lane: "Taken",
        stages: { Raised: "approved", "Law HOD": "pending", "CSE HOD": "pending", Tech: "pending" },
        comments: [],
      },
    ]);
    setForm({
      title: "",
      description: "",
      category: "",
      priority: "Moderate",
      location: "",
      photo: "",
    });
    setOpen(false);
    if (whatsapp || systemMsg) {
      setAlertLog((l) => [
        `${id} raised — alert sent via ${[whatsapp && "WhatsApp", systemMsg && "System Message"]
          .filter(Boolean)
          .join(" + ")}`,
        ...l,
      ]);
    }
  };

  const setStage = (ticketId: string, stage: Stage, status: StageStatus) =>
    setTickets((list) =>
      list.map((t) => (t.id === ticketId ? { ...t, stages: { ...t.stages, [stage]: status } } : t)),
    );

  const raiseDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!can("raiseTicket")}>
          <Plus className="size-4" /> Raise a Ticket
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a Ticket (Issue Request)</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            submitTicket();
          }}
        >
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["High", "Moderate", "Low"] as Priority[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="location">Location (Dept / Floor / Building / Lab)</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="photo">Attach Photo</Label>
            <label
              htmlFor="photo"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground"
            >
              <ImagePlus className="size-5 text-primary" />
              {form.photo || "Click to attach a photo of the issue"}
            </label>
            <input
              id="photo"
              type="file"
              className="hidden"
              onChange={(e) =>
                setForm((f) => ({ ...f, photo: e.target.files?.[0]?.name ?? "" }))
              }
            />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit">Submit Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell moduleTitle="Ticket & Dispatch (Call Action Taken)">
      <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "raise" ? (
        <SectionCard
          title="Ticket Raise (Issue Request)"
          description="Any role can raise an issue request."
          action={raiseDialog}
        >
          {tickets.length === 0 ? (
            <EmptyState
              icon={TicketCheck}
              message="No tickets raised yet."
              action={
                <Button variant="outline" onClick={() => setOpen(true)} disabled={!can("raiseTicket")}>
                  <Plus className="size-4" /> Raise a Ticket
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {t.id} · {t.title}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {t.category || "Uncategorised"} · {t.location || "No location"}
                    </p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ) : null}

      {tab === "triage" ? (
        <div className="space-y-6">
          <SectionCard
            title="Priority Rating Matrix"
            description="Set Urgency × Impact to derive the resulting priority."
          >
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary">
                    <th className="p-3 text-left font-bold">Urgency ↓ / Impact →</th>
                    {IMPACT.map((i) => (
                      <th key={i} className="p-3 text-left font-bold">
                        {i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {URGENCY.map((u) => (
                    <tr key={u} className="border-t border-border">
                      <th className="p-3 text-left font-semibold">{u}</th>
                      {IMPACT.map((i) => {
                        const active = urgency === u && impact === i;
                        return (
                          <td key={i} className="p-2">
                            <button
                              onClick={() => {
                                setUrgency(u);
                                setImpact(i);
                              }}
                              disabled={!can("triage")}
                              className={`w-full rounded-lg border px-3 py-2 text-left font-semibold transition-colors ${
                                active
                                  ? "border-primary bg-accent text-accent-foreground"
                                  : "border-border hover:bg-secondary"
                              } disabled:opacity-60`}
                            >
                              {matrixPriority(u, i)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              Resulting rating: <PriorityBadge priority={matrixPriority(urgency, impact)} />
            </p>
          </SectionCard>

          <SectionCard
            title="Request Intake"
            description="Apply the matrix rating to incoming tickets."
            action={raiseDialog}
          >
            {tickets.length === 0 ? (
              <EmptyState icon={Inbox} message="No incoming tickets to triage yet." />
            ) : (
              <ul className="space-y-3">
                {tickets.map((t) => (
                  <li
                    key={t.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {t.id} · {t.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current priority: {t.priority}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!can("triage")}
                      onClick={() =>
                        setTickets((list) =>
                          list.map((x) =>
                            x.id === t.id
                              ? { ...x, priority: matrixPriority(urgency, impact) }
                              : x,
                          ),
                        )
                      }
                    >
                      Apply {matrixPriority(urgency, impact)}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      ) : null}

      {tab === "approval" ? (
        <SectionCard
          title="Multi-Tier Approval Pipeline"
          description="Raised → Law HOD → CSE HOD → Tech"
          action={raiseDialog}
        >
          {tickets.length === 0 ? (
            <EmptyState icon={ListChecks} message="No tickets in the approval pipeline yet." />
          ) : (
            <div className="space-y-4">
              <div className="w-full sm:w-72">
                <Label className="mb-2 block">Select ticket</Label>
                <Select value={selected ?? tickets[0]?.id ?? ""} onValueChange={setSelected}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tickets.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.id} · {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(() => {
                const ticket = activeTicket ?? tickets[0];
                if (!ticket) return null;
                return (
                  <div className="space-y-5 rounded-xl border border-border p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      {STAGES.map((stage) => {
                        const status = ticket.stages[stage];
                        return (
                          <div key={stage} className="rounded-xl border border-border p-4">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-bold">{stage}</p>
                              <span
                                className={`grid size-6 place-items-center rounded-full text-xs ${
                                  status === "approved"
                                    ? "bg-success text-success-foreground"
                                    : status === "rejected"
                                      ? "bg-destructive text-destructive-foreground"
                                      : "bg-warning text-warning-foreground"
                                }`}
                              >
                                {status === "approved" ? (
                                  <Check className="size-3.5" />
                                ) : status === "rejected" ? (
                                  <X className="size-3.5" />
                                ) : (
                                  "•"
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-xs capitalize text-muted-foreground">{status}</p>
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                disabled={!can("approve") || stage === "Raised"}
                                onClick={() => setStage(ticket.id, stage, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!can("approve") || stage === "Raised"}
                                onClick={() => setStage(ticket.id, stage, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="grid gap-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Input
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder={`Comment as ${role}`}
                        />
                      </div>
                      <Button
                        variant="outline"
                        disabled={!can("approve") || !comment.trim()}
                        onClick={() => {
                          setTickets((list) =>
                            list.map((t) =>
                              t.id === ticket.id
                                ? { ...t, comments: [...t.comments, `${role}: ${comment}`] }
                                : t,
                            ),
                          );
                          setComment("");
                        }}
                      >
                        <MessageSquare className="size-4" /> Comment
                      </Button>
                    </div>

                    {ticket.comments.length > 0 ? (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {ticket.comments.map((c, i) => (
                          <li key={i} className="rounded-lg bg-secondary px-3 py-2">
                            {c}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          )}
        </SectionCard>
      ) : null}

      {tab === "lifecycle" ? (
        <SectionCard
          title="Lifecycle Status Tracker"
          description="Drag tickets between stages."
          action={raiseDialog}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {LANES.map((lane) => {
              const laneTickets = tickets.filter((t) => t.lane === lane);
              return (
                <div
                  key={lane}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId && can("moveTickets")) {
                      setTickets((list) =>
                        list.map((t) => (t.id === dragId ? { ...t, lane } : t)),
                      );
                    }
                    setDragId(null);
                  }}
                  className="min-h-56 rounded-xl border border-border bg-surface p-3"
                >
                  <p className="mb-3 flex items-center justify-between text-sm font-bold">
                    {lane}
                    <Badge variant="secondary">{laneTickets.length}</Badge>
                  </p>
                  {laneTickets.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
                      No tickets in this stage.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {laneTickets.map((t) => (
                        <li
                          key={t.id}
                          draggable={can("moveTickets")}
                          onDragStart={() => setDragId(t.id)}
                          className="cursor-grab rounded-xl border border-border bg-card p-3 shadow-card active:cursor-grabbing"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-muted-foreground">{t.id}</span>
                            <PriorityBadge priority={t.priority} />
                          </div>
                          <p className="mt-1 truncate font-semibold">{t.title}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : null}

      {tab === "alerts" ? (
        <SectionCard title="Alert Notification" description="Alert channels and event log.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
              <Label htmlFor="wa">Send WhatsApp Alert</Label>
              <Switch id="wa" checked={whatsapp} onCheckedChange={setWhatsapp} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
              <Label htmlFor="sys">Send System Message Alert</Label>
              <Switch id="sys" checked={systemMsg} onCheckedChange={setSystemMsg} />
            </div>
          </div>
          <div className="mt-6">
            {alertLog.length === 0 ? (
              <EmptyState icon={BellRing} message="No alert events logged yet." />
            ) : (
              <ul className="space-y-2 text-sm">
                {alertLog.map((a, i) => (
                  <li key={i} className="rounded-lg border border-border px-3 py-2">
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SectionCard>
      ) : null}
    </AppShell>
  );
}
