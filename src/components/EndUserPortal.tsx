import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ImagePlus,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  END_USER_REQUEST_STATUS_STEPS,
  getEndUserRoleProfile,
  getTicketProgressIndex,
} from "@/lib/end-user-portal";
import { useRole, type Role } from "@/lib/roles";

const roleIcons = {
  Faculty: BriefcaseBusiness,
  "Teaching Staff": GraduationCap,
  "Non-Teaching Staff": Building2,
  Student: UserRound,
  Department: ShieldCheck,
} as const;

const SAMPLE_REQUESTS: Ticket[] = [
  {
    id: "REQ-0001",
    ticketNumber: "TKT-001",
    title: "Projector display error in lecture hall",
    category: "Classroom & AV Systems",
    priority: "High",
    location: "1102",
    description: "The projector shows a no signal message and the HDMI input on the podium is unstable.",
    technician: "Tech Assistant 1",
    startedAt: "Sep 16, 2026",
    statusIndex: 0,
  },
  {
    id: "REQ-0002",
    ticketNumber: "TKT-002",
    title: "Campus Wi-Fi weak signal in library wing",
    category: "Network, Wi-Fi & Internet",
    priority: "Moderate",
    location: "2204",
    description: "Users report intermittent connectivity and poor signal around the east-side study tables.",
    technician: "Tech Assistant 2",
    startedAt: "Sep 18, 2026",
    statusIndex: 1,
  },
  {
    id: "REQ-0003",
    ticketNumber: "TKT-003",
    title: "Desktop workstation not powering on",
    category: "Computer Lab & Desktop Hardware",
    priority: "High",
    location: "3403",
    description: "One workstation in the lab does not boot and keeps shutting down immediately after power on.",
    technician: "Tech Assistant 3",
    startedAt: "Sep 20, 2026",
    statusIndex: 2,
  },
];

const ISSUE_OPTIONS = {
  "Classroom & AV Systems": [
    'Projector Display Error ("No Signal" / Blurry / Lamp Fault)',
    "Podium / Wireless Microphone Silent or Static",
    "HDMI / VGA / Type-C Cable Missing or Damaged",
    "Smart Interactive Board Uncalibrated or Unresponsive",
    "Other",
  ],
  "Network, Wi-Fi & Internet": [
    "Campus Wi-Fi Dead Zone / Weak Signal",
    "Captive Portal / Login Authentication Error",
    "Wall Ethernet (RJ45) Socket Inactive",
    "Latency / Slow Bandwidth",
    "Other",
  ],
  "Computer Lab & Desktop Hardware": [
    "System Won't Power On / Blue Screen (BSOD)",
    "Faulty Keyboard, Mouse, or Headset",
    "Monitor Display Flicker / Power Failure",
    "Local Lab UPS / Power Strip Tripped",
    "Other",
  ],
  "Software, OS & Licensing": [
    "Academic Software License Expired (MATLAB, AutoCAD, etc.)",
    "Fresh OS Re-imaging Request",
    "Virus / Malware Warning Triggered",
    "Other",
  ],
} as const;

const BUILDINGS = ["1", "2", "3", "4", "5"] as const;
const FLOORS = ["1", "2", "3", "4"] as const;
const ROOMS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

type Ticket = {
  id: string;
  ticketNumber?: string;
  title: string;
  category: string;
  priority: "High" | "Moderate" | "Low";
  location: string;
  description: string;
  technician: string;
  startedAt: string;
  statusIndex: 0 | 1 | 2;
};

const emptyForm = {
  description: "",
  category: "",
  issue: "",
  otherIssue: "",
  userName: "",
  userEmail: "",
  userId: "",
  userPhone: "",
  building: "",
  floor: "",
  room: "",
  photo: "",
};

export function EndUserPortal({ role }: { role?: Role }) {
  const { session } = useRole();
  const activeRole = role ?? session?.role ?? "Student";
  const profile = getEndUserRoleProfile(activeRole);
  const Icon = roleIcons[profile.role];
  const [tickets, setTickets] = useState<Ticket[]>(SAMPLE_REQUESTS);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState<"All" | "Submitted" | "In Progress" | "Resolved">("All");

  const visibleTickets = tickets.filter((ticket) => {
    const ticketStatus = getTicketProgressIndex(ticket);

    if (statusFilter === "All") return true;
    if (statusFilter === "Submitted") return ticketStatus === 0;
    if (statusFilter === "In Progress") return ticketStatus === 1;
    return ticketStatus === 2;
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !form.category ||
      !form.issue ||
      (form.issue === "Other" && !form.otherIssue.trim()) ||
      !form.description.trim() ||
      !form.userName.trim() ||
      !form.building ||
      !form.floor ||
      !form.room
    ) {
      return;
    }

    const nextTicket: Ticket = {
      id: `REQ-${String(tickets.length + 1).padStart(4, "0")}`,
      ticketNumber: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      title: form.issue === "Other" ? form.otherIssue.trim() : form.issue,
      category: form.category,
      priority: "Moderate",
      location: `${form.building}${form.floor}${form.room}`,
      description: form.description.trim(),
      technician: "Unassigned",
      startedAt: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      statusIndex: 0,
    };

    setTickets((previous) => [nextTicket, ...previous]);
    setForm(emptyForm);
    setRequestDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Welcome back</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
            {session?.name ?? "User"}, {profile.title}
          </h1>
          {profile.subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{profile.subtitle}</p>
          ) : null}
        </div>

        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2 self-start">
              <Plus className="size-4" /> Raise New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Raise a Ticket (Issue Request)</DialogTitle>
            </DialogHeader>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      category: value,
                      issue: "",
                      otherIssue: "",
                    }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ISSUE_OPTIONS) as Array<keyof typeof ISSUE_OPTIONS>).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="issue">Issue Type</Label>
                <Select
                  value={form.issue}
                  onValueChange={(value) => setForm((current) => ({ ...current, issue: value, otherIssue: "" }))}
                  disabled={!form.category}
                >
                  <SelectTrigger id="issue">
                    <SelectValue placeholder="Select an issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {form.category
                      ? ISSUE_OPTIONS[form.category as keyof typeof ISSUE_OPTIONS].map((issue) => (
                          <SelectItem key={issue} value={issue}>
                            {issue}
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
              </div>

              {form.issue === "Other" ? (
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="other-issue">Specify the issue</Label>
                  <Input
                    id="other-issue"
                    value={form.otherIssue}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, otherIssue: event.target.value }))
                    }
                    placeholder="Describe the issue"
                    required
                  />
                </div>
              ) : null}

              <div className="grid gap-2 sm:col-span-2">
                <Label>Requester details</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="user-name">Name</Label>
                    <Input
                      id="user-name"
                      value={form.userName}
                      onChange={(event) => setForm((current) => ({ ...current, userName: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={form.userEmail}
                      onChange={(event) => setForm((current) => ({ ...current, userEmail: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-id">User ID</Label>
                    <Input
                      id="user-id"
                      value={form.userId}
                      onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-phone">Phone</Label>
                    <Input
                      id="user-phone"
                      value={form.userPhone}
                      onChange={(event) => setForm((current) => ({ ...current, userPhone: event.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label>Location Code (Building / Floor / Room)</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select
                    value={form.building}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, building: value, floor: "", room: "" }))
                    }
                  >
                    <SelectTrigger aria-label="Building">
                      <SelectValue placeholder="Building" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILDINGS.map((building) => (
                        <SelectItem key={building} value={building}>
                          Building {building}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={form.floor}
                    onValueChange={(value) => setForm((current) => ({ ...current, floor: value, room: "" }))}
                    disabled={!form.building}
                  >
                    <SelectTrigger aria-label="Floor">
                      <SelectValue placeholder="Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOORS.map((floor) => (
                        <SelectItem key={floor} value={floor}>
                          Floor {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={form.room}
                    onValueChange={(value) => setForm((current) => ({ ...current, room: value }))}
                    disabled={!form.floor}
                  >
                    <SelectTrigger aria-label="Room or lab">
                      <SelectValue placeholder="Room / Lab" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOMS.map((room) => (
                        <SelectItem key={room} value={room}>
                          Room {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="photo">Attach Photo</Label>
                <label
                  htmlFor="photo"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground"
                >
                  <ImagePlus className="size-5 text-primary" />
                  {form.photo || "Attach photo"}
                </label>
                <input
                  id="photo"
                  type="file"
                  className="hidden"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      photo: event.target.files?.[0]?.name ?? "",
                    }))
                  }
                />
              </div>

              <DialogFooter className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={
                    !form.category ||
                    !form.issue ||
                    (form.issue === "Other" && !form.otherIssue.trim()) ||
                    !form.building ||
                    !form.floor ||
                    !form.room
                  }
                  className="gap-2"
                >
                  <Send className="size-4" /> Submit Ticket
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Active requests</h2>
            <p className="text-sm text-muted-foreground">
              {visibleTickets.length === 0
                ? "No requests submitted yet."
                : `${visibleTickets.length} request${visibleTickets.length > 1 ? "s" : ""} shown.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Wrench className="size-3.5" />
              {tickets.length === 0 ? "Ready for intake" : "Support team queued"}
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {visibleTickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Clock3 className="size-5" />
            </div>
            <p className="text-base font-semibold text-foreground">No active requests yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your submitted tickets will appear here with their status timeline and technician updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleTickets.map((ticket) => {
              const progressIndex = getTicketProgressIndex(ticket);
              const currentStatus = END_USER_REQUEST_STATUS_STEPS[progressIndex];

              return (
                <article key={ticket.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                          {ticket.category}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-foreground">{ticket.title}</h3>
                    </div>

                    {progressIndex > 0 && ticket.ticketNumber ? (
                      <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-right text-sm">
                        <p className="text-muted-foreground">Ticket Number :</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                          {ticket.ticketNumber}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        <span>Progress</span>
                        <span className="font-semibold text-foreground">{currentStatus}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {END_USER_REQUEST_STATUS_STEPS.map((step, index) => {
                          const isDone = index <= progressIndex;

                          return (
                            <div key={step} className="space-y-2">
                              <div
                                className={`h-2 rounded-full ${
                                  isDone ? "bg-primary" : "bg-muted-foreground/20"
                                }`}
                              />
                              <p className="text-[10px] font-medium text-muted-foreground">{step}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">Request details</p>
                      <p className="mt-2">{ticket.location}</p>
                      <p className="mt-1">Started {ticket.startedAt}</p>
                      <p className="mt-3 line-clamp-3 text-foreground">{ticket.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
