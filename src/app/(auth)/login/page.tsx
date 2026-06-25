"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 24 4a20 20 0 1 0 19.6 16.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}



export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEmailValid = email.length === 0 || /^\S+@\S+\.\S+$/.test(email);
  const isPwValid = pw.length === 0 || pw.length >= 8;
  const matches = mode === "signup" ? confirm.length === 0 || confirm === pw : true;

  // Auto-redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect") || "/dashboard";
        router.push(redirect);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !pw) {
      setError("Please fill in all fields.");
      return;
    }
    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signup" && pw !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (mode === "signup" && !terms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: pw,
        });
        if (signInError) throw signInError;
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect") || "/dashboard";
        router.push(redirect);
      } else {
        // Read affiliate cookie if exists
        let affiliateId = null;
        const match = document.cookie.match(/(^| )tpp_affiliate=([^;]+)/);
        if (match) affiliateId = match[2];

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            data: affiliateId ? { affiliate_id: affiliateId } : undefined,
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // Track contest referral if cookie exists
          const contestMatch = document.cookie.match(/(^| )tpp_contest_ref=([^;]+)/);
          if (contestMatch && contestMatch[2] && data.session.user) {
            try {
              await fetch('/api/contest/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  referral_code: contestMatch[2],
                  user_id: data.session.user.id,
                  email: data.session.user.email || '',
                }),
              });
              // Clear the cookie
              document.cookie = 'tpp_contest_ref=; path=/; max-age=0';
            } catch (e) {
              console.error('Contest tracking error:', e);
            }
          }
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get("redirect") || "/dashboard";
          router.push(redirect);
        } else {
          setSuccess("Registration successful! Please check your email to verify your account.");
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An authentication error occurred.";
      setError(errorMsg);
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
            Welcome to TPP
          </div>
          <h1 className="font-display text-4xl xl:text-5xl leading-[1.04] tracking-[-0.03em] mb-6">
            Trade our capital.
            <br />
            Keep the <span className="text-[var(--lime)]">profits</span>.
          </h1>
          <p className="text-white/55 leading-relaxed mb-10 text-[15px]">
            Join 28,000+ funded traders worldwide. Bi-weekly payouts, up to 90%
            split, and the fairest rules in the industry.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "$24.6M", l: "Paid out" },
              { v: "96%", l: "< 24h payouts" },
              { v: "142", l: "Countries" },
              { v: "90%", l: "Max split" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="font-display text-xl text-white tabular-nums">
                  {s.v}
                </div>
                <div className="text-xs text-white/45 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/40">
          &copy; {new Date().getFullYear()} The People Prop &mdash; Guaranteed free evaluation Prizes on 1 August 2026
        </div>
      </aside>

      {/* Right form */}
      <main className="relative flex flex-col justify-center px-5 sm:px-10 lg:px-16 py-12 lg:py-0 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 mt-6">
          <Logo />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Toggle */}
          <div
            className="relative mb-10 grid grid-cols-2 p-1 rounded-full border border-[var(--border)] bg-[var(--paper)]"
            style={{ width: "min(320px, 100%)" }}
          >
            <motion.div
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              animate={{ x: mode === "signin" ? 0 : "100%" }}
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-[var(--ink-950)]"
              aria-hidden="true"
            />
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setMode(m);
                }}
                disabled={loading}
                className={cn(
                  "relative z-10 py-2 text-sm font-medium rounded-full transition-colors text-center cursor-pointer disabled:opacity-50",
                  mode === m ? "text-white" : "text-[var(--ink-600)] hover:text-[var(--ink-950)]",
                )}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-[var(--ink-950)] leading-[1.05] tracking-tight">
                {mode === "signin" ? (
                  <>Welcome <span className="word-serif">back</span>.</>
                ) : (
                  <>Create your <span className="word-serif">account</span>.</>
                )}
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-600)] mb-6">
                {mode === "signin"
                  ? "Sign in to access your dashboard, payouts, and challenges."
                  : "Start your evaluation in minutes. No commitment required."}
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

              <form
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                {/* Email */}
                <div>
                  <label htmlFor="email" className="text-xs text-[var(--ink-700)] mb-2 block font-medium">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-500)]" strokeWidth={2.2} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className={cn(
                        "w-full h-12 pl-11 pr-4 rounded-xl bg-[var(--paper)] border text-sm text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none transition-colors",
                        isEmailValid
                          ? "border-[var(--border)] focus:border-[var(--accent-600)] focus:bg-white"
                          : "border-red-300 focus:border-red-500",
                      )}
                    />
                  </div>
                  {!isEmailValid && (
                    <p className="mt-1.5 text-xs text-red-600">
                      Enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="pw" className="text-xs text-[var(--ink-700)] font-medium">
                      Password
                    </label>
                    {mode === "signin" && (
                      <Link
                        href="#"
                        className="text-xs text-[var(--accent-700)] hover:text-[var(--accent-800)] font-medium"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-500)]" strokeWidth={2.2} />
                    <input
                      id="pw"
                      type={show ? "text" : "password"}
                      value={pw}
                      disabled={loading}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      onChange={(e) => setPw(e.target.value)}
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

                {/* Confirm + terms */}
                {mode === "signup" && (
                  <>
                    <div>
                      <label htmlFor="confirm" className="text-xs text-[var(--ink-700)] mb-2 block font-medium">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-500)]" strokeWidth={2.2} />
                        <input
                          id="confirm"
                          type={show ? "text" : "password"}
                          value={confirm}
                          disabled={loading}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Confirm password"
                          className={cn(
                            "w-full h-12 pl-11 pr-4 rounded-xl bg-[var(--paper)] border text-sm text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none transition-colors",
                            matches
                              ? "border-[var(--border)] focus:border-[var(--accent-600)] focus:bg-white"
                              : "border-red-300 focus:border-red-500",
                          )}
                        />
                      </div>
                      {!matches && (
                        <p className="mt-1.5 text-xs text-red-600">Passwords don&apos;t match.</p>
                      )}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                      <span
                        className={cn(
                          "mt-0.5 grid place-items-center w-[18px] h-[18px] rounded-md border transition-all shrink-0",
                          terms
                            ? "bg-[var(--ink-950)] border-[var(--ink-950)]"
                            : "bg-white border-[var(--border-strong)]",
                        )}
                      >
                        {terms && <Check className="w-3 h-3 text-[#D8F26B]" strokeWidth={3} />}
                      </span>
                      <input
                        type="checkbox"
                        checked={terms}
                        disabled={loading}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-xs text-[var(--ink-600)] leading-relaxed">
                        I agree to the{" "}
                        <Link href="#" className="text-[var(--ink-950)] underline underline-offset-2">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-[var(--ink-950)] underline underline-offset-2">
                          Risk Disclosure
                        </Link>
                        .
                      </span>
                    </label>
                  </>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  className="mt-2 cursor-pointer"
                >
                  {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                  {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2.2} />}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--ink-500)]">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                        },
                      });
                      if (error) throw error;
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "An error occurred with Google Sign-In");
                      setLoading(false);
                    }
                  }}
                  disabled={loading} 
                  className="h-11 rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--paper)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-center gap-2 text-sm text-[var(--ink-950)] font-medium cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon /> Google
                </button>
              </div>

              <p className="mt-8 text-xs text-[var(--ink-500)] text-center">
                {mode === "signin" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      disabled={loading}
                      className="text-[var(--accent-700)] hover:text-[var(--accent-800)] font-medium cursor-pointer disabled:opacity-50"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      disabled={loading}
                      className="text-[var(--accent-700)] hover:text-[var(--accent-800)] font-medium cursor-pointer disabled:opacity-50"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
