import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { EndUserPortal } from "@/components/EndUserPortal";

export const Route = createFileRoute("/teaching-staff")({
  component: TeachingStaffPage,
});

function TeachingStaffPage() {
  return (
    <AppShell moduleTitle="Teaching staff portal">
      <EndUserPortal role="Teaching Staff" />
    </AppShell>
  );
}
