import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { EndUserPortal } from "@/components/EndUserPortal";

export const Route = createFileRoute("/department")({
  component: DepartmentPage,
});

function DepartmentPage() {
  return (
    <AppShell moduleTitle="Department portal">
      <EndUserPortal role="Department" />
    </AppShell>
  );
}
