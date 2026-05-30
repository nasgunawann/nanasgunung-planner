import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconSparkles,
  IconCalendarEvent,
  IconPencil,
  IconCalendarWeek,
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconBolt,
} from "@tabler/icons-react";

export default function Landing() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,145,77,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,107,53,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,145,77,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,107,53,0.12),transparent_28%),linear-gradient(180deg,rgba(22,22,22,0.92),rgba(18,18,18,1))]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 dark:opacity-20" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-xl space-y-6">
            <header className="flex items-center justify-start">
              <Link href="/" aria-label="Nanasgunung Planner home">
                <Image
                  src="/logo-black.svg"
                  alt="Nanasgunung Planner"
                  width={480}
                  height={48}
                  className="block h-24 w-auto dark:hidden"
                />
                <Image
                  src="/logo-white.svg"
                  alt="Nanasgunung Planner"
                  width={480}
                  height={48}
                  className="hidden h-24 w-auto dark:block"
                />
              </Link>
            </header>

            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Plan content faster, without losing creative flow.
              </h1>
              <p className="max-w-prose text-base leading-7 text-muted-foreground sm:text-lg">
                Nanasgunung Planner is a compact workspace for creators to
                collect ideas, shape drafts, and move from brainstorm to
                calendar with less friction.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link href="/dashboard">
                  Open Planner (Demo)
                  <IconArrowRight className="size-4" />
                </Link>
              </Button>

              {/* <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-6"
              >
                <Link href="/login">Login</Link>
              </Button> */}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-card/70 px-3 py-1 shadow-sm">
                With ❤️, by{" "}
                <a href="https://github.com/nasgunawann">@Nasgunawann</a>
              </span>
            </div>
          </div>

          <div className="relative pt-6 lg:pt-0">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-4 pb-36 shadow-xl backdrop-blur-md sm:p-6 sm:pb-40">
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                <div className="space-y-1">
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    May 2026
                  </h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-2 py-1 text-muted-foreground shadow-sm">
                  <IconChevronLeft className="size-4" />
                  <span className="text-xs font-semibold">Today</span>
                  <IconChevronRight className="size-4" />
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="grid grid-cols-7 gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="text-center">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }, (_, index) => {
                    const dayNumber = index + 1;
                    const isToday = dayNumber === 30;
                    const isActive = [2, 8, 12, 17, 24, 28, 30].includes(
                      dayNumber,
                    );

                    return (
                      <div
                        key={dayNumber}
                        className={[
                          "flex aspect-square items-center justify-center rounded-xl border text-[11px] font-semibold transition-colors",
                          isToday
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : isActive
                              ? "border-primary/25 bg-primary/8 text-foreground"
                              : "border-border/60 bg-background/70 text-muted-foreground",
                        ].join(" ")}
                      >
                        {dayNumber}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 lg:left-8 lg:right-8">
                <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-2xl shadow-black/10 ring-1 ring-primary/10">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <IconSparkles className="size-4" />
                      </div>
                      <div>
                        <p className="font-bold">AI Brainstormer</p>
                      </div>
                    </div>
                    <IconDots className="size-4 text-muted-foreground" />
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Ide:
                      </span>{" "}
                      Cara jadi programmer handal, tapi malas ngoding.
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Platform
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          Instagram Reels
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Gaya Bicara
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          Friendly, sharp
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
