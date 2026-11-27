"use client";

import { useActionState, useState } from "react";
import { AuthHeading, AuthNotices, AuthShell, authField, authLabel } from "@/components/v2/glass/auth-shell";
import { cn } from "@/lib/utils";
import { completeSignupProfile } from "./actions";

export function CompleteProfileForm({ name }: { name: string }) {
  const [error, submit, pending] = useActionState(completeSignupProfile, null);
  const [fullName, setFullName] = useState(name);
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <AuthShell eyebrow="The People Prop" lead="Trader dashboard." lede="Manage your account and challenges in one place.">
      <AuthHeading lead="Complete your" fade="profile." lede="Add your name and mobile number to finish signing up." />
      <AuthNotices error={error} success={null} />

      <form action={submit} className="space-y-5">
        <div>
          <label htmlFor="full-name" className={authLabel}>Full name</label>
          <input
            id="full-name"
            name="fullName"
            autoComplete="name"
            required
            maxLength={100}
            readOnly={pending}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={cn(authField(false), "px-4")}
          />
        </div>
        <div>
          <label htmlFor="mobile-number" className={authLabel}>Mobile number</label>
          <input
            id="mobile-number"
            name="phoneNumber"
            type="tel"
            autoComplete="tel"
            required
            maxLength={40}
            readOnly={pending}
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+91 98765 43210"
            aria-describedby="mobile-number-help"
            className={cn(authField(false), "px-4")}
          />
          <p id="mobile-number-help" className="mt-2 text-xs text-white/55">Include your country code.</p>
        </div>
        <button type="submit" disabled={pending} className="g-btn g-btn-lime w-full cursor-pointer disabled:opacity-60">
          {pending ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </AuthShell>
  );
}
