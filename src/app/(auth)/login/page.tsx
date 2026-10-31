"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { AuthHeading, AuthNotices, AuthShell, authField, authLabel } from "@/components/v2/glass/auth-shell";
import { href } from "@/components/v2/glass/routes";

type Mode = "signin" | "signup" | "forgot";

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

  const step = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } };
  const linkButton = "cursor-pointer font-semibold text-[var(--g-lime)] transition-colors hover:text-[var(--g-lime-soft)] disabled:opacity-50";

  return (
    <AuthShell
      eyebrow="Welcome to TPP"
      lead="Fund your skills."
      fade="Trade our capital."
      lede="Your dashboard, challenges and payouts, all in one place."
    >
      {/* Toggle */}
      <div className="relative mb-10 grid w-full max-w-[320px] grid-cols-2 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
        <motion.div
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          animate={{ x: mode === "signin" || mode === "forgot" ? 0 : "100%" }}
          className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white"
          aria-hidden="true"
        />
        {(["signin", "signup"] as const).map((m) => (
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
              "relative z-10 cursor-pointer rounded-full py-2.5 text-center text-[14px] font-semibold transition-colors disabled:opacity-50",
              (mode === m || (mode === "forgot" && m === "signin")) ? "text-[var(--g-ink)]" : "text-white/60 hover:text-white",
            )}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "forgot" ? (
          <motion.div key="forgot" {...step}>
            <AuthHeading lead="Reset your" fade="password." lede="Enter your email and we'll send you a reset link." />
            <AuthNotices error={error} success={success} />

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setSuccess(null);
                if (!email) {
                  setError("Please enter your email address.");
                  return;
                }
                setLoading(true);
                try {
                  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/auth/reset-password',
                  });
                  if (resetError) throw resetError;
                  setSuccess("Check your email for a password reset link.");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "An error occurred.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div>
                <label htmlFor="forgot-email" className={authLabel}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2.2} />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className={cn(authField(!isEmailValid), "pr-4 pl-11")}
                  />
                </div>
                {!isEmailValid && <p className="mt-1.5 text-[12.5px] text-red-300">Enter a valid email address.</p>}
              </div>

              <button type="submit" disabled={loading} className="g-btn g-btn-lime group mt-2 w-full cursor-pointer disabled:opacity-60">
                {loading ? "Please wait..." : "Send Reset Link"}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />}
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-white/50">
              <button type="button" onClick={() => { setError(null); setSuccess(null); setMode("signin"); }} disabled={loading} className={linkButton}>
                Back to Sign In
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div key={mode} {...step}>
            {mode === "signin" ? (
              <AuthHeading lead="Welcome" fade="back." lede="Sign in to access your dashboard, payouts, and challenges." />
            ) : (
              <AuthHeading lead="Create your" fade="account." lede="Start your evaluation in minutes. No commitment required." />
            )}
            <AuthNotices error={error} success={success} />

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className={authLabel}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2.2} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className={cn(authField(!isEmailValid), "pr-4 pl-11")}
                  />
                </div>
                {!isEmailValid && <p className="mt-1.5 text-[12.5px] text-red-300">Enter a valid email address.</p>}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="pw" className="text-[13px] font-medium text-white/70">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => { setError(null); setSuccess(null); setMode("forgot"); }} className={cn(linkButton, "text-[12.5px]")}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2.2} />
                  <input
                    id="pw"
                    type={show ? "text" : "password"}
                    value={pw}
                    disabled={loading}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    onChange={(e) => setPw(e.target.value)}
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

              {/* Confirm + terms */}
              {mode === "signup" && (
                <>
                  <div>
                    <label htmlFor="confirm" className={authLabel}>
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2.2} />
                      <input
                        id="confirm"
                        type={show ? "text" : "password"}
                        value={confirm}
                        disabled={loading}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Confirm password"
                        className={cn(authField(!matches), "pr-4 pl-11")}
                      />
                    </div>
                    {!matches && <p className="mt-1.5 text-[12.5px] text-red-300">Passwords don&apos;t match.</p>}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 pt-1 select-none">
                    <span
                      className={cn(
                        "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md ring-1 transition-all",
                        terms ? "bg-[var(--g-lime)] ring-[var(--g-lime)]" : "bg-white/[0.05] ring-white/20",
                      )}
                    >
                      {terms && <Check className="h-3 w-3 text-[var(--g-ink)]" strokeWidth={3} />}
                    </span>
                    <input type="checkbox" checked={terms} disabled={loading} onChange={(e) => setTerms(e.target.checked)} className="sr-only" />
                    <span className="text-[13px] leading-relaxed text-white/55">
                      I agree to the{" "}
                      <Link href={href("terms")} target="_blank" className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href={href("risk-disclosure")} target="_blank" className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">
                        Risk Disclosure
                      </Link>
                      .
                    </span>
                  </label>
                </>
              )}

              <button type="submit" disabled={loading} className="g-btn g-btn-lime group mt-2 w-full cursor-pointer disabled:opacity-60">
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11.5px] tracking-wider text-white/40 uppercase">or continue with</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

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
              className="g-btn g-btn-glass w-full cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon /> Google
            </button>

            <p className="mt-8 text-center text-[13px] text-white/50">
              {mode === "signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button type="button" onClick={() => setMode("signup")} disabled={loading} className={linkButton}>
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("signin")} disabled={loading} className={linkButton}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
