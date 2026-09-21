import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { EndUserPortal } from "@/components/EndUserPortal";

export const Route = createFileRoute("/student")({
  component: StudentPage,
});

function StudentPage() {
  return (
    <AppShell moduleTitle="Student portal">
      <EndUserPortal role="Student" />
    </AppShell>
  );
}
