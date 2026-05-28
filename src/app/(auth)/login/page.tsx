"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <div className="w-full max-w-md rounded-lg border border-border/60 bg-background p-6">
      <h2 className="text-lg font-semibold">Sign in</h2>
      <form
        className="mt-4 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          // placeholder: simulate login
          router.push("/calendar");
        }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none"
        />
        <div className="flex justify-end">
          <button className="rounded bg-primary px-3 py-2 text-white">
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
