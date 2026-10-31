"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { AuthHeading, AuthNotices, AuthShell, authField, authLabel } from "@/components/v2/glass/auth-shell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPwValid = password.length === 0 || password.length >= 8;
  const matches = confirmPassword.length === 0 || confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure your account"
      lead="Set a new"
      fade="password."
      lede="Choose a strong password to keep your trading account secure. Your password must be at least 8 characters."
    >
      <AuthHeading lead="Set new" fade="password." lede="Enter your new password below." />
      <AuthNotices error={error} success={success} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* New Password */}
        <div>
          <label htmlFor="password" className={authLabel}>
            New Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2.2} />
            <input
              id="password"
              type={show ? "text" : "password"}
              value={password}
              disabled={loading}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={cn(authField(!isPwValid), "pr-12 pl-11")}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
              disabled={loading}
              className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-white/45 transition-colors hover:text-white"
            >
              {show ? <EyeOff className="h-4 w-4" strokeWidth={2.2} /> : <Eye className="h-4 w-4" strokeWidth={2.2} />}
            </button>
          </div>
          {!isPwValid && <p className="mt-1.5 text-[12.5px] text-red-300">Password must be at least 8 characters.</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className={authLabel}>
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2.2} />
            <input
              id="confirmPassword"
              type={show ? "text" : "password"}
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={cn(authField(!matches), "pr-4 pl-11")}
            />
          </div>
          {!matches && <p className="mt-1.5 text-[12.5px] text-red-300">Passwords don&apos;t match.</p>}
        </div>

        <button type="submit" disabled={loading} className="g-btn g-btn-lime group mt-2 w-full cursor-pointer disabled:opacity-60">
          {loading ? "Please wait..." : "Set New Password"}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-white/50">
        Remember your password?{" "}
        <a href="/login" className="font-semibold text-[var(--g-lime)] transition-colors hover:text-[var(--g-lime-soft)]">
          Sign in
        </a>
      </p>
    </AuthShell>
  );
}
