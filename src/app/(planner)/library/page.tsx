import {
  IconBooks,
  IconClockHour4,
  IconRecycle,
  IconTags,
} from "@tabler/icons-react";
import PageTransition from "@/components/page-transition";

const templates = [
  { title: "Launch teaser", type: "Video", usage: "4 times" },
  { title: "Education carousel", type: "Post", usage: "7 times" },
  { title: "Community story", type: "Stories", usage: "11 times" },
];

export default function LibraryPage() {
  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Templates", value: "12" },
            { label: "Reusable blocks", value: "28" },
            { label: "Archived posts", value: "94" },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-[1.75rem] border border-border/60 bg-card/75 p-4 shadow-sm shadow-black/5"
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                {metric.value}
              </p>
            </article>
          ))}
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <article
              key={template.title}
              className="rounded-[1.75rem] border border-border/60 bg-card/75 p-5 shadow-sm shadow-black/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    {template.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {template.type}
                  </p>
                </div>
                <div className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground">
                  Used {template.usage}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-sm shadow-black/5">
          <div className="flex items-center gap-3">
            <IconBooks className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Archive view
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold">
                Recent reuse patterns
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {[
              "Promotional story set reused for launch weeks.",
              "Educational carousel structure reused across three campaigns.",
              "Short-form video outline reused with platform-specific hooks.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border/60 bg-background/75 p-3 text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-sm shadow-black/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Trend tags
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold">
                What gets reused
              </h3>
            </div>
            <IconTags className="size-5 text-muted-foreground" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Launch", "Education", "Promo", "UGC", "FAQ", "Stories"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background px-3 py-1.5"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-sm shadow-black/5">
          <div className="flex items-center gap-3">
            <IconRecycle className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                History
              </p>
              <h3 className="mt-1 font-heading text-xl font-semibold">
                Recent updates
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p className="rounded-2xl border border-border/60 bg-background/75 p-3">
              Updated launch teaser structure 2 hours ago.
            </p>
            <p className="rounded-2xl border border-border/60 bg-background/75 p-3">
              Archived 3 draft ideas after review yesterday.
            </p>
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/75 p-3">
              <IconClockHour4 className="size-4" />
              Synced with planning workflow today.
            </div>
          </div>
        </div>
      </aside>
      </div>
    </PageTransition>
  );
}
