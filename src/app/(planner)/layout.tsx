import type { ReactNode } from "react";
import PlannerShell from "@/components/planner-shell";
import { DraftsProvider } from "@/lib/drafts";

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return (
    <DraftsProvider>
      <PlannerShell>{children}</PlannerShell>
    </DraftsProvider>
  );
}
