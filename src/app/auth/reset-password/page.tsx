"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--paper)]">
      {/* Left brand panel — dark, signature lime */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[#0a0a0a] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -left-24 w-[700px] h-[700px] rounded-full bg-[rgba(203,251,69,0.16)] blur-3xl pointer-events-none"
        />

        <div className="relative z-10">
          <Logo invert />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)]" />
            Secure your account
          </div>
          <h1 className="font-display text-4xl xl:text-5xl leading-[1.04] tracking-[-0.03em] mb-6">
            Set a new
            <br />
            <span className="text-[var(--lime)]">password</span>.
          </h1>
          <p className="text-white/55 leading-relaxed mb-10 text-[15px]">
            Choose a strong password to keep your trading account secure. Your password must be at least 8 characters.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          &copy; {new Date().getFullYear()} The People Prop
        </div>
      </aside>

      {/* Right form */}
      <main className="relative flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-12 lg:py-0 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 mt-6">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-md">
          <h2 className="font-display text-3xl md:text-4xl text-[var(--ink-950)] leading-[1.05] tracking-tight">
            Set new <span className="word-serif">password</span>.
          </h2>
          <p className="mt-3 text-sm text-[var(--ink-600)] mb-6">
            Enter your new password below.
          </p>

          {/* Status messages */}
          <div className="space-y-3 mb-6">
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">
                {success}
              </div>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label htmlFor="password" className="text-xs text-[var(--ink-700)] mb-2 block font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-500)]" strokeWidth={2.2} />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  disabled={loading}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={cn(
                    "w-full h-12 pl-11 pr-12 rounded-xl bg-[var(--paper)] border text-sm text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none transition-colors",
                    isPwValid
                      ? "border-[var(--border)] focus:border-[var(--accent-600)] focus:bg-white"
                      : "border-red-300 focus:border-red-500",
                  )}
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow((s) => !s)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-md text-[var(--ink-500)] hover:text-[var(--ink-950)] cursor-pointer"
                >
                  {show ? <EyeOff className="w-4 h-4" strokeWidth={2.2} /> : <Eye className="w-4 h-4" strokeWidth={2.2} />}
                </button>
              </div>
              {!isPwValid && (
                <p className="mt-1.5 text-xs text-red-600">
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="text-xs text-[var(--ink-700)] mb-2 block font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-500)]" strokeWidth={2.2} />
                <input
                  id="confirmPassword"
                  type={show ? "text" : "password"}
                  value={confirmPassword}
                  disabled={loading}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className={cn(
                    "w-full h-12 pl-11 pr-4 rounded-xl bg-[var(--paper)] border text-sm text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none transition-colors",
                    matches
                      ? "border-[var(--border)] focus:border-[var(--accent-600)] focus:bg-white"
                      : "border-red-300 focus:border-red-500",
                  )}
                />
              </div>
              {!matches && (
                <p className="mt-1.5 text-xs text-red-600">
                  Passwords don&apos;t match.
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-2 cursor-pointer"
            >
              {loading ? "Please wait..." : "Set New Password"}
              {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
            </Button>
          </form>

          <p className="mt-8 text-xs text-[var(--ink-500)] text-center">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-[var(--accent-700)] hover:text-[var(--accent-800)] font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
