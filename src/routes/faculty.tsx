import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { EndUserPortal } from "@/components/EndUserPortal";

export const Route = createFileRoute("/faculty")({
  component: FacultyPage,
});

function FacultyPage() {
  return (
    <AppShell moduleTitle="Faculty portal">
      <EndUserPortal role="Faculty" />
    </AppShell>
  );
}
