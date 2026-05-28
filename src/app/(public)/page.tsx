import Link from "next/link";

export default function Landing() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl font-heading font-semibold">
        Nanasgunung Planner
      </h1>
      <p className="mt-4 text-muted-foreground">
        Simple content planning for creators.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/calendar"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Open Planner
        </Link>
        <Link
          href="/auth/login"
          className="rounded-md border border-border px-4 py-2"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
