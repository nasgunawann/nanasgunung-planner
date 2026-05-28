"use client";

import { useDrafts } from "@/lib/drafts";

export default function DraftsPage() {
  const { drafts } = useDrafts();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="rounded-md border border-border/60 bg-card/75 p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.platform} • {d.updatedAt}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">{d.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
