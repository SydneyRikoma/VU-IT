import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title = "No data yet",
  message,
  action,
}: {
  icon: LucideIcon;
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="icon-orb grid size-16 place-items-center rounded-full">
        <Icon className="size-7 text-primary" strokeWidth={1.75} />
      </div>
      <p className="text-base font-bold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
