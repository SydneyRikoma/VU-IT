import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { EndUserPortal } from "@/components/EndUserPortal";

export const Route = createFileRoute("/non-teaching-staff")({
  component: NonTeachingStaffPage,
});

function NonTeachingStaffPage() {
  return (
    <AppShell moduleTitle="Non-teaching staff portal">
      <EndUserPortal role="Non-Teaching Staff" />
    </AppShell>
  );
}
