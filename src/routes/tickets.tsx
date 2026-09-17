import { createFileRoute } from "@tanstack/react-router";
import { BellRing, ImagePlus, Inbox, KanbanSquare, Plus, TicketCheck } from "lucide-react";
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
type Lane =
  | "Assigned"
  | "In Progress"
  | "Pending CISO Verification"
  | "Closed & Archived";

type UserDetails = {
  name: string;
  email: string;
  id: string;
  phone: string;
};

type Ticket = {
  id: string;
  requestedAt: string;
  title: string;
  description: string;
  category: string;
  technicalAssistant: string;
  priority: Priority;
  action: "Pending" | "Approved" | "Rejected";
  user: UserDetails;
  location: string;
  photo: string;
  lane: Lane;
  status: "IN_PROGRESS" | "COMPLETED";
  technicianNotes: string;
  replacedParts: string[];
  proofImage: string;
  cisoReason: string;
  closedAt?: string;
};

const LANES: Lane[] = [
  "Assigned",
  "In Progress",
  "Pending CISO Verification",
  "Closed & Archived",
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

type IssueCategory = keyof typeof ISSUE_OPTIONS;

const BUILDINGS = ["1", "2", "3", "4", "5"] as const;
const FLOORS = ["1", "2", "3", "4"] as const;
const ROOMS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const TECHNICAL_ASSISTANTS = ["Tech Assistant 1", "Tech Assistant 2", "Tech Assistant 3"] as const;
const REPLACEMENT_COMPONENT_OPTIONS = [
  "HDMI cable",
  "Power supply unit",
  "Antenna connector",
  "Patch lead",
  "Microphone battery",
  "RF receiver cable",
  "AV input board",
  "Access reader cable",
  "Projector remote",
  "Keyboard",
  "Mouse",
  "Monitor cable",
  "Other",
] as const;

const SAMPLE_TICKETS: Ticket[] = [
  {
    id: "TKT-001",
    requestedAt: "2026-09-16 08:15 AM",
    title: "Projector display error in lecture hall",
    description: "The projector shows a no signal message and the HDMI cable connection appears loose.",
    category: "Classroom & AV Systems",
    technicalAssistant: "Tech Assistant 1",
    priority: "High",
    action: "Pending",
    user: {
      name: "Aisha Mokoena",
      email: "aisha.mokoena@vu.ac.za",
      id: "STU-20481",
      phone: "+27 82 112 2031",
    },
    location: "1102",
    photo: "projector-issue.jpg",
    lane: "Assigned",
    status: "IN_PROGRESS",
    technicianNotes:
      "Replaced the damaged HDMI cable, reseated the projector input board, and recalibrated the display output. The no-signal warning cleared immediately after the cable swap.",
    replacedParts: ["HDMI cable", "AV input board"],
    proofImage: "projector-repair.jpg",
    cisoReason: "",
  },
  {
    id: "TKT-002",
    requestedAt: "2026-09-16 09:42 AM",
    title: "Campus Wi-Fi weak signal in library wing",
    description: "Users report intermittent connectivity and poor signal strength near the east-side study tables.",
    category: "Network, Wi-Fi & Internet",
    technicalAssistant: "Tech Assistant 2",
    priority: "Moderate",
    action: "Approved",
    user: {
      name: "Daniel Kibet",
      email: "daniel.kibet@vu.ac.za",
      id: "STA-11890",
      phone: "+27 76 454 9910",
    },
    location: "2204",
    photo: "wifi-check.jpg",
    lane: "In Progress",
    status: "IN_PROGRESS",
    technicianNotes:
      "Access point placement verified. Re-commissioned the east-side AP and replaced a faulty antenna connector to restore signal stability.",
    replacedParts: ["Antenna connector", "Patch lead"],
    proofImage: "wifi-ap-repair.jpg",
    cisoReason: "",
  },
  {
    id: "TKT-003",
    requestedAt: "2026-09-16 10:28 AM",
    title: "Desktop system not powering on",
    description: "One workstation in the computer lab powers down immediately after pressing the power button.",
    category: "Computer Lab & Desktop Hardware",
    technicalAssistant: "Tech Assistant 3",
    priority: "High",
    action: "Pending",
    user: {
      name: "Chloe Thompson",
      email: "chloe.thompson@vu.ac.za",
      id: "FAC-00971",
      phone: "+27 71 503 7022",
    },
    location: "3403",
    photo: "lab-pc.jpg",
    lane: "Assigned",
    status: "IN_PROGRESS",
    technicianNotes:
      "Power supply tested and replaced after the PSU fan failed. Workstation booted successfully after the unit was reset and re-tested under load.",
    replacedParts: ["Power supply unit"],
    proofImage: "desktop-power-fix.jpg",
    cisoReason: "",
  },
  {
    id: "TKT-004",
    requestedAt: "2026-09-16 11:05 AM",
    title: "AutoCAD license expired on workstation",
    description: "Students cannot launch the licensed AutoCAD application due to an expired seat license.",
    category: "Software, OS & Licensing",
    technicalAssistant: "Tech Assistant 1",
    priority: "Low",
    action: "Rejected",
    user: {
      name: "Mpho Ndlovu",
      email: "mpho.ndlovu@vu.ac.za",
      id: "STU-31140",
      phone: "+27 83 776 4451",
    },
    location: "1507",
    photo: "",
    lane: "Closed & Archived",
    status: "COMPLETED",
    technicianNotes:
      "License renewal request escalated and cleared after reactivation. End-user workstation was verified against the central license pool.",
    replacedParts: [],
    proofImage: "license-verified.jpg",
    cisoReason: "Closed after expiry check and software validation.",
    closedAt: "2026-09-16 12:10 PM",
  },
  {
    id: "TKT-005",
    requestedAt: "2026-09-16 01:20 PM",
    title: "Wireless microphone static during seminar",
    description: "The podium microphone produces static noise and fails to connect reliably to the AV mixer.",
    category: "Classroom & AV Systems",
    technicalAssistant: "Tech Assistant 2",
    priority: "Moderate",
    action: "Approved",
    user: {
      name: "Lethabo Mokoena",
      email: "lethabo.mokoena@vu.ac.za",
      id: "FAC-20261",
      phone: "+27 72 319 8877",
    },
    location: "3101",
    photo: "microphone-static.jpg",
    lane: "Pending CISO Verification",
    status: "IN_PROGRESS",
    technicianNotes:
      "Audio mixer channel was re-paired, the wireless receiver was reset, and the microphone battery was replaced. Signal stability recovered during the live test.",
    replacedParts: ["Microphone battery", "RF receiver cable"],
    proofImage: "microphone-proof.jpg",
    cisoReason: "",
  },
  {
    id: "TKT-006",
    requestedAt: "2026-09-17 08:40 AM",
    title: "Projector remote fails to power on",
    description: "The lecture hall remote battery is fine, but the device does not respond and the projector stays on standby.",
    category: "Classroom & AV Systems",
    technicalAssistant: "Tech Assistant 1",
    priority: "High",
    action: "Pending",
    user: {
      name: "Zanele Khumalo",
      email: "zanele.khumalo@vu.ac.za",
      id: "FAC-34910",
      phone: "+27 81 550 1188",
    },
    location: "1204",
    photo: "projector-remote.jpg",
    lane: "Assigned",
    status: "IN_PROGRESS",
    technicianNotes: "Remote signal check pending. Confirming IR receiver and projector power command path.",
    replacedParts: [],
    proofImage: "",
    cisoReason: "",
  },
  {
    id: "TKT-007",
    requestedAt: "2026-09-17 09:15 AM",
    title: "Lab access door reader not authenticating",
    description: "The staff access reader intermittently rejects valid cards and logs duplicate failed attempts.",
    category: "Computer Lab & Desktop Hardware",
    technicalAssistant: "Tech Assistant 3",
    priority: "Moderate",
    action: "Pending",
    user: {
      name: "Sibusiso Nene",
      email: "sibusiso.nene@vu.ac.za",
      id: "STA-44088",
      phone: "+27 79 226 8165",
    },
    location: "2502",
    photo: "reader-error.jpg",
    lane: "Assigned",
    status: "IN_PROGRESS",
    technicianNotes: "Card reader power cycle performed and door controller communication re-checked. Waiting for final access test.",
    replacedParts: ["Access reader cable"],
    proofImage: "",
    cisoReason: "",
  },
];

function PriorityBadge({ priority }: { priority: Priority }) {
  const tone =
    priority === "High"
      ? "border border-red-400 bg-transparent text-black"
      : priority === "Moderate"
        ? "border border-amber-400 bg-transparent text-black"
        : "border border-emerald-400 bg-transparent text-black";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>{priority}</span>;
}

const TABS = [
  { id: "triage", label: "Request Intake & Triage", icon: Inbox },
  { id: "lifecycle", label: "Lifecycle Status Tracker", icon: KanbanSquare },
  { id: "alerts", label: "Alert Notification", icon: BellRing },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TicketsPage() {
  const { role, can, session } = useRole();
  const [tab, setTab] = useState<TabId>("triage");
  const [tickets, setTickets] = useState<Ticket[]>(SAMPLE_TICKETS);
  const [open, setOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [systemMsg, setSystemMsg] = useState(false);
  const [alertLog, setAlertLog] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string>(SAMPLE_TICKETS[0]?.id ?? "");
  const [rejectReason, setRejectReason] = useState("");
  const [completionDialogTicketId, setCompletionDialogTicketId] = useState<string | null>(null);
  const [completionDraft, setCompletionDraft] = useState("");
  const [completionPhotoName, setCompletionPhotoName] = useState("");

  const currentAssistantName = session?.name?.trim() ?? "";

  const isTicketAssignedToCurrentAssistant = (ticket: Ticket) => {
    if (!currentAssistantName) return true;

    const ticketName = ticket.technicalAssistant.trim().toLowerCase();
    const sessionName = currentAssistantName.trim().toLowerCase();

    if (sessionName === "technical assistant" || sessionName === "tech assistant") {
      return ticketName.includes("tech assistant");
    }

    return (
      ticketName === sessionName ||
      ticketName.includes(sessionName) ||
      sessionName.includes(ticketName)
    );
  };

  const assignedTickets =
    role === "Technical Assistant"
      ? tickets.filter((ticket) => isTicketAssignedToCurrentAssistant(ticket))
      : tickets;

  const handleTechStatusUpdate = (ticketId: string, nextLane: Lane, nextStatus: Ticket["status"]) => {
    setTickets((list) =>
      list.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              lane: nextLane,
              status: nextStatus,
            }
          : ticket,
      ),
    );
  };

  const completionTicket =
    completionDialogTicketId !== null
      ? assignedTickets.find((ticket) => ticket.id === completionDialogTicketId) ?? null
      : null;

  const confirmCompletion = () => {
    if (!completionDialogTicketId) return;

    setTickets((list) =>
      list.map((ticket) =>
        ticket.id === completionDialogTicketId
          ? {
              ...ticket,
              lane: "Pending CISO Verification",
              status: "IN_PROGRESS",
              technicianNotes:
                completionDraft.trim() ||
                ticket.technicianNotes.trim() ||
                "Issue was resolved and is awaiting CISO verification.",
            }
          : ticket,
      ),
    );

    setCompletionDialogTicketId(null);
    setCompletionDraft("");
    setCompletionPhotoName("");
  };

  if (role === "Technical Assistant") {
    return (
      <AppShell moduleTitle="Ticket & Dispatch (Call Action Taken)">
        <div className="space-y-6">
          <SectionCard
            title="My Assigned Tickets"
            description="Pick up assigned problems, log when work begins, and send completion notes back for review."
          >
            {assignedTickets.length === 0 ? (
              <EmptyState
                icon={Inbox}
                message="No tickets have been assigned to you yet. Once the CISO assigns a case, it will appear here."
              />
            ) : (
              <div className="space-y-4">
                {assignedTickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {ticket.id}
                        </p>
                        <h3 className="mt-1 text-xl font-bold">{ticket.title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={ticket.priority} />
                        <Badge variant={ticket.lane === "Pending CISO Verification" ? "secondary" : "default"}>
                          {ticket.lane}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            Requester
                          </p>
                          <p className="mt-1 font-semibold text-foreground">{ticket.user.name}</p>
                          <p>{ticket.user.email}</p>
                          <p>{ticket.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            Issue details
                          </p>
                          <p className="mt-1 font-medium text-foreground">{ticket.category}</p>
                          <p>{ticket.description}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            Location
                          </p>
                          <p className="mt-1 font-semibold text-foreground">{ticket.location}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {ticket.lane === "Assigned" ? (
                            <Button
                              type="button"
                              onClick={() => handleTechStatusUpdate(ticket.id, "In Progress", "IN_PROGRESS")}
                            >
                              Start Work
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                  setCompletionDialogTicketId(ticket.id);
                                  setCompletionDraft(ticket.technicianNotes);
                                  setCompletionPhotoName("");
                                }}
                                disabled={ticket.lane === "Pending CISO Verification"}
                              >
                                Mark as Solved
                              </Button>
                            </>
                          )}
                        </div>

                        {ticket.lane !== "Assigned" ? (
                          <div className="grid gap-2 rounded-xl border border-border bg-surface p-3">
                            <Label htmlFor={`replacement-part-${ticket.id}`} className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                              Component used / replaced
                            </Label>
                            <Select
                              value={ticket.replacedParts[ticket.replacedParts.length - 1] ?? ""}
                              onValueChange={(value) => {
                                setTickets((list) =>
                                  list.map((item) =>
                                    item.id === ticket.id
                                      ? {
                                          ...item,
                                          replacedParts: Array.from(
                                            new Set([...item.replacedParts, value]),
                                          ),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                            >
                              <SelectTrigger id={`replacement-part-${ticket.id}`}>
                                <SelectValue placeholder="Select component used or exchanged" />
                              </SelectTrigger>
                              <SelectContent>
                                {REPLACEMENT_COMPONENT_OPTIONS.map((item) => (
                                  <SelectItem key={`${ticket.id}-${item}`} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : null}

                        {ticket.lane !== "Assigned" && ticket.replacedParts.length > 0 ? (
                          <div className="rounded-xl border border-border bg-surface p-3">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                              Parts replaced
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                              {ticket.replacedParts.map((part) => (
                                <li key={`${ticket.id}-${part}`}>{part}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {completionTicket ? (
          <Dialog
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setCompletionDialogTicketId(null);
                setCompletionDraft("");
              }
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Completion details for {completionTicket.id}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  Add a quick update for this resolved issue, or continue without writing anything.
                </p>

                <div className="grid gap-2">
                  <Label htmlFor="completion-photo-upload">Upload proof photo</Label>
                  <label
                    htmlFor="completion-photo-upload"
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground"
                  >
                    <span className="truncate">{completionPhotoName || "Choose photo for proof of completion"}</span>
                    <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-foreground">
                      Upload
                    </span>
                  </label>
                  <input
                    id="completion-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setCompletionPhotoName(event.target.files?.[0]?.name ?? "")
                    }
                  />
                </div>

                <Textarea
                  value={completionDraft}
                  onChange={(event) => setCompletionDraft(event.target.value)}
                  placeholder="Describe what was fixed, replaced, or checked."
                  className="min-h-32"
                />
              </div>

              <DialogFooter className="mt-4 gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCompletionDialogTicketId(null);
                    setCompletionDraft("");
                    setCompletionPhotoName("");
                  }}
                >
                  Continue without notes
                </Button>
                <Button type="button" onClick={confirmCompletion}>
                  Submit completion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </AppShell>
    );
  }

  if (role !== "CISO") {
    return (
      <AppShell moduleTitle="Ticket & Dispatch (Call Action Taken)">
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-lg font-semibold">Access restricted</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is available to the CISO or Technical Assistant only.
          </p>
        </div>
      </AppShell>
    );
  }

  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? tickets[0] ?? null;

  const handleCisoDecision = (decision: "approve" | "reject") => {
    if (!selectedTicket || !can("approve")) return;

    if (decision === "approve") {
      setTickets((list) =>
        list.map((ticket) =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                action: "Approved",
                lane: "Closed & Archived",
                status: "COMPLETED",
                cisoReason: "Approved by CISO",
                closedAt: new Date().toLocaleString(),
              }
            : ticket,
        ),
      );
      setAlertLog((log) => [
        `${selectedTicket.id} approved and archived to the NAAC / NBA Audit Log.`,
        ...log,
      ]);
      return;
    }

    const reason = rejectReason.trim();
    setTickets((list) =>
      list.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              action: "Rejected",
              lane: "In Progress",
              status: "IN_PROGRESS",
              cisoReason: reason,
            }
          : ticket,
      ),
    );
    setAlertLog((log) => [
      `${selectedTicket.id} rejected and reopened for technician follow-up. Reason: ${reason}`,
      ...log,
    ]);
    setRejectReason("");
  };

  const [form, setForm] = useState({
    description: "",
    category: "" as IssueCategory | "",
    issue: "",
    otherIssue: "",
    userName: "",
    userEmail: "",
    userId: "",
    userPhone: "",
    technicalAssistant: "",
    priority: "Moderate" as Priority,
    building: "",
    floor: "",
    room: "",
    photo: "",
  });

  const submitTicket = () => {
    const id = `TKT-${String(tickets.length + 1).padStart(3, "0")}`;
    setTickets((t) => [
      ...t,
      {
        id,
        requestedAt: new Date().toLocaleString(),
        description: form.description,
        category: form.category,
        technicalAssistant: form.technicalAssistant,
        priority: form.priority,
        title: form.issue === "Other" ? form.otherIssue : form.issue,
        user: {
          name: form.userName.trim() || "Unknown User",
          email: form.userEmail.trim() || "unknown@vu.ac.za",
          id: form.userId.trim() || "N/A",
          phone: form.userPhone.trim() || "N/A",
        },
        location: `${form.building}${form.floor}${form.room}`,
        action: "Pending" as const,
        lane: "Assigned",
        photo: form.photo,
      },
    ]);
    setForm({
      description: "",
      category: "",
      issue: "",
      otherIssue: "",
      userName: "",
      userEmail: "",
      userId: "",
      userPhone: "",
      technicalAssistant: "",
      priority: "Moderate",
      building: "",
      floor: "",
      room: "",
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                setForm((f) => ({
                  ...f,
                  category: value as IssueCategory,
                  issue: "",
                  otherIssue: "",
                }))
              }
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ISSUE_OPTIONS) as IssueCategory[]).map((category) => (
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
              onValueChange={(value) => setForm((f) => ({ ...f, issue: value, otherIssue: "" }))}
              disabled={!form.category}
            >
              <SelectTrigger id="issue">
                <SelectValue placeholder="Select an issue" />
              </SelectTrigger>
              <SelectContent>
                {form.category
                  ? ISSUE_OPTIONS[form.category].map((issue) => (
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
                onChange={(e) => setForm((f) => ({ ...f, otherIssue: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={form.userEmail}
                  onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
                  placeholder="name@vu.ac.za"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={form.userId}
                  onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                  placeholder="STU-12345"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-phone">Phone</Label>
                <Input
                  id="user-phone"
                  value={form.userPhone}
                  onChange={(e) => setForm((f) => ({ ...f, userPhone: e.target.value }))}
                  placeholder="+27 71 123 4567"
                />
              </div>
            </div>
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
          <div className="grid gap-2">
            <Label htmlFor="technical-assistant">Technical Assistant</Label>
            <Select
              value={form.technicalAssistant}
              onValueChange={(value) => setForm((f) => ({ ...f, technicalAssistant: value }))}
            >
              <SelectTrigger id="technical-assistant">
                <SelectValue placeholder="Assign an assistant" />
              </SelectTrigger>
              <SelectContent>
                {TECHNICAL_ASSISTANTS.map((assistant) => (
                  <SelectItem key={assistant} value={assistant}>
                    {assistant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Location Code (Building / Floor / Room)</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Select
                value={form.building}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, building: value, floor: "", room: "" }))
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
                onValueChange={(value) => setForm((f) => ({ ...f, floor: value, room: "" }))}
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
                onValueChange={(value) => setForm((f) => ({ ...f, room: value }))}
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
            <p className="text-xs text-muted-foreground">
              {form.building && form.floor && form.room
                ? `Location code: ${form.building}${form.floor}${form.room}`
                : "Select a building, floor and room to generate the four-digit code."}
            </p>
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
              onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files?.[0]?.name ?? "" }))}
            />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button
              type="submit"
              disabled={
                !form.category ||
                !form.issue ||
                (form.issue === "Other" && !form.otherIssue.trim()) ||
                !form.technicalAssistant ||
                !form.building ||
                !form.floor ||
                !form.room
              }
            >
              Submit Ticket
            </Button>
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

      {tab === "triage" ? (
        <div className="space-y-6">
          <SectionCard
            title="Received Requests"
            description="Assign a technical assistant and approve or reject each request."
            action={raiseDialog}
          >
            {tickets.length === 0 ? (
              <EmptyState icon={Inbox} message="No incoming tickets to triage yet." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-3 text-left font-bold">Request Time</th>
                      <th className="p-3 text-left font-bold">User</th>
                      <th className="p-3 text-left font-bold">Issue</th>
                      <th className="p-3 text-left font-bold">Location</th>
                      <th className="p-3 text-left font-bold">Assign Technician</th>
                      <th className="p-3 text-left font-bold">Set Priority Level</th>
                      <th className="p-3 text-left font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} className="border-t border-border align-top">
                        <td className="p-3 whitespace-nowrap">{t.requestedAt}</td>
                        <td className="p-3">
                          <div className="min-w-[220px]">
                            <p className="font-semibold">{t.user.name}</p>
                            <p className="text-xs text-muted-foreground">{t.user.email}</p>
                            <p className="text-xs text-muted-foreground">{t.user.phone}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="min-w-52">
                            <p className="font-semibold">{t.category}</p>
                            <p className="text-xs text-muted-foreground">{t.title}</p>
                          </div>
                        </td>
                        <td className="p-3 font-semibold">{t.location}</td>
                        <td className="p-3">
                          <Select
                            value={t.technicalAssistant}
                            onValueChange={(value) =>
                              setTickets((list) =>
                                list.map((x) =>
                                  x.id === t.id ? { ...x, technicalAssistant: value } : x,
                                ),
                              )
                            }
                            disabled={!can("triage") || t.action !== "Pending"}
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue placeholder="Assign technician" />
                            </SelectTrigger>
                            <SelectContent>
                              {TECHNICAL_ASSISTANTS.map((assistant) => (
                                <SelectItem key={assistant} value={assistant}>
                                  {assistant}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Select
                            value={t.priority}
                            onValueChange={(value) =>
                              setTickets((list) =>
                                list.map((x) =>
                                  x.id === t.id ? { ...x, priority: value as Priority } : x,
                                ),
                              )
                            }
                            disabled={!can("triage") || t.action !== "Pending"}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(["High", "Moderate", "Low"] as Priority[]).map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">
                          <Select
                            value={t.action === "Pending" ? "" : t.action}
                            onValueChange={(value) =>
                              setTickets((list) =>
                                list.map((x) =>
                                  x.id === t.id ? { ...x, action: value as Ticket["action"] } : x,
                                ),
                              )
                            }
                            disabled={
                              !can("triage") || !t.technicalAssistant || t.action !== "Pending"
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Choose action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Approved">Approve</SelectItem>
                              <SelectItem value="Rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                          {t.action !== "Pending" ? (
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">
                              {t.action}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

        </div>
      ) : null}

      {tab === "lifecycle" ? (
        <SectionCard
          title="Lifecycle Status Tracker"
          action={raiseDialog}
        >
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border bg-card p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-bold">Tracked Tickets</p>
                <Badge variant="secondary">{tickets.length}</Badge>
              </div>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setRejectReason("");
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? "border-primary bg-accent/20"
                        : "border-border bg-surface hover:bg-secondary/70"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-muted-foreground">{ticket.id}</span>
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="font-semibold">{ticket.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.user.name} · {ticket.location}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTicket ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Ticket {selectedTicket.id}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{selectedTicket.title}</h3>
                  </div>
                  <Badge variant={selectedTicket.status === "COMPLETED" ? "secondary" : "default"}>
                    {selectedTicket.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS"}
                  </Badge>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="space-y-3">
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Issue
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {selectedTicket.category}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedTicket.title}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Requested By
                        </p>
                        <p className="mt-2 font-semibold text-foreground">{selectedTicket.user.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedTicket.user.email}</p>
                        <p className="text-sm text-muted-foreground">{selectedTicket.user.phone}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Location
                        </p>
                        <p className="mt-2 text-3xl font-black tracking-tight">
                          {selectedTicket.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="space-y-3">
                      <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          Hardware swapped from active stock
                        </p>
                        {selectedTicket.replacedParts.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                            {selectedTicket.replacedParts.map((part) => (
                              <li key={part}>{part}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">
                            No components were replaced from active stock.
                          </p>
                        )}
                      </div>
                      <div className="rounded-xl border border-dashed border-border bg-card p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <ImagePlus className="size-4 text-primary" />
                          Repair image attachment
                        </div>
                        <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-8 text-center text-sm text-muted-foreground">
                          {selectedTicket.proofImage || "No proof image attached"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="space-y-3">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => handleCisoDecision("approve")}
                        disabled={!can("approve") || selectedTicket.status === "COMPLETED"}
                      >
                        Approve & Close Ticket
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleCisoDecision("reject")}
                        disabled={!can("approve") || selectedTicket.status === "COMPLETED"}
                      >
                        Reject & Re-Open
                      </Button>

                      <div className="rounded-xl border border-border bg-card p-3">
                        <Label htmlFor="reject-reason">Reason for rejection</Label>
                        <Textarea
                          id="reject-reason"
                          value={rejectReason}
                          onChange={(event) => setRejectReason(event.target.value)}
                          placeholder=""
                          className="mt-2 min-h-24"
                        />
                      </div>


                    </div>
                  </div>
                </div>
              </div>
            ) : null}
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
