import { Button } from "@/components/ui/button";

export default function BrainstormPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/60 bg-card/75 p-3">
        <textarea
          className="min-h-40 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
          placeholder="Describe the content and audience"
        />
        <div className="mt-3 flex justify-end">
          <Button variant="secondary">Generate</Button>
        </div>
      </div>
    </div>
  );
}
