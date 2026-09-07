import { useRef, useState } from "react";
import { CheckCircle2, Inbox, Paperclip, Send, Upload, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { SectionCard } from "@/components/SectionCard";
import { useRole } from "@/lib/roles";

const reportSchema = z.object({
  location: z
    .string()
    .trim()
    .nonempty({ message: "Location of issue is required." })
    .max(120, { message: "Location must be under 120 characters." }),
  subject: z
    .string()
    .trim()
    .nonempty({ message: "Subject line is required." })
    .max(140, { message: "Subject must be under 140 characters." }),
  description: z
    .string()
    .trim()
    .nonempty({ message: "Detailed description is required." })
    .max(2000, { message: "Description must be under 2000 characters." }),
  assetId: z
    .string()
    .trim()
    .max(60, { message: "Asset ID must be under 60 characters." })
    .optional(),
});

type FieldErrors = Partial<Record<"location" | "subject" | "description" | "assetId", string>>;

type SubmittedReport = {
  id: string;
  location: string;
  subject: string;
  description: string;
  assetId: string;
  attachments: string[];
  submittedAt: string;
};

const emptyForm = { location: "", subject: "", description: "", assetId: "" };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReporterPortal() {
  const { session } = useRole();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reports, setReports] = useState<SubmittedReport[]>([]);
  const [justSubmitted, setJustSubmitted] = useState<string | null>(null);

  const set = (key: keyof typeof emptyForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 5));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = reportSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setJustSubmitted(null);
      return;
    }
    const ticketId = `REQ-${String(reports.length + 1).padStart(4, "0")}`;
    setReports((prev) => [
      {
        id: ticketId,
        location: parsed.data.location,
        subject: parsed.data.subject,
        description: parsed.data.description,
        assetId: parsed.data.assetId ?? "",
        attachments: files.map((f) => f.name),
        submittedAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setForm(emptyForm);
    setFiles([]);
    setErrors({});
    setJustSubmitted(ticketId);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <SectionCard
        title="Report an IT issue"
        description={`Signed in as ${session?.name ?? ""} · ${session?.role ?? ""}. Fill in the details below and the IT team will triage your request.`}
      >
        {justSubmitted ? (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                Report submitted · reference {justSubmitted}
              </p>
              <p className="text-muted-foreground">
                You can track its progress in “My reports”.
              </p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="location">Location of issue</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location")(e.target.value)}
              placeholder="Block / floor / room or lab name"
              maxLength={120}
              aria-invalid={!!errors.location}
            />
            {errors.location ? (
              <p className="text-xs font-medium text-destructive">{errors.location}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject line</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => set("subject")(e.target.value)}
              placeholder="One-line summary of the problem"
              maxLength={140}
              aria-invalid={!!errors.subject}
            />
            {errors.subject ? (
              <p className="text-xs font-medium text-destructive">{errors.subject}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="description">Detailed description</Label>
              <span className="text-xs text-muted-foreground">
                {form.description.length}/2000
              </span>
            </div>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="What happened, when it started, and anything you already tried"
              rows={6}
              maxLength={2000}
              aria-invalid={!!errors.description}
            />
            {errors.description ? (
              <p className="text-xs font-medium text-destructive">{errors.description}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assetId">
              Asset ID or serial number{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="assetId"
              value={form.assetId}
              onChange={(e) => set("assetId")(e.target.value)}
              placeholder="Printed on the device tag, if available"
              maxLength={60}
              aria-invalid={!!errors.assetId}
            />
            {errors.assetId ? (
              <p className="text-xs font-medium text-destructive">{errors.assetId}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="attachments">
              Attachments{" "}
              <span className="font-normal text-muted-foreground">(optional, up to 5)</span>
            </Label>
            <label
              htmlFor="attachments"
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <Upload className="size-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Click to add photos or documents
              </span>
              <span className="text-xs text-muted-foreground">
                Screenshots, error photos, PDF — max 5 files
              </span>
            </label>
            <input
              ref={fileRef}
              id="attachments"
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => addFiles(e.target.files)}
            />
            {files.length ? (
              <ul className="grid gap-2 pt-1">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button type="submit" className="gap-2">
              <Send className="size-4" /> Submit report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(emptyForm);
                setFiles([]);
                setErrors({});
                setJustSubmitted(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="My reports" description="Requests you submitted in this session.">
        {reports.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No reports yet"
            message="Submitted requests will appear here with their reference number."
          />
        ) : (
          <ul className="grid gap-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {report.id}
                  </span>
                  <span className="text-xs text-muted-foreground">{report.submittedAt}</span>
                </div>
                <p className="mt-2 font-semibold">{report.subject}</p>
                <p className="text-sm text-muted-foreground">{report.location}</p>
                <p className="mt-2 line-clamp-3 text-sm">{report.description}</p>
                {report.assetId ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Asset / serial: <span className="font-semibold">{report.assetId}</span>
                  </p>
                ) : null}
                {report.attachments.length ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="size-3" /> {report.attachments.length} attachment
                    {report.attachments.length > 1 ? "s" : ""}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
