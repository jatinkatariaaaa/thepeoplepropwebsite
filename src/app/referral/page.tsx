"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, DollarSign, Target, Award, Trophy } from "lucide-react";
import { DashboardSidebar, MobileTopBar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReferralLinkBox } from "@/components/dashboard/ReferralLinkBox";
import { TierProgress } from "@/components/dashboard/TierProgress";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { supabase, UserProfile } from "@/lib/supabase";

export default function ReferralPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuthAndFetchProfile() {
      // 1. Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        if (active) {
          router.push("/login");
        }
        return;
      }

      // Extract username from email
      const emailPrefix = user.email ? user.email.split("@")[0] : "Partner";
      const cleanCode = emailPrefix.toUpperCase().replace(/[^A-Z0-9]/g, "") || "PARTNER";

      // Provision fallback profile first for instant UI response
      const localKey = `tpp_profile_${user.id}`;
      let fallbackProfile: UserProfile = {
        id: user.id,
        display_name: emailPrefix, // exactly the letters in their email prefix
        referral_code: cleanCode,
        referrals_count: 0,
        earnings: 0.00,
        conversion_rate: 0.00,
        global_rank: 8,
      };

      // Try loading from localStorage to get cached stats if any
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) {
          fallbackProfile = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error reading localStorage:", e);
      }

      if (active) {
        setProfile(fallbackProfile);
      }

      // 2. Fetch user profile stats from Supabase DB
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData) {
          // Profile doesn't exist in DB - insert fallback
          const { error: insertError } = await supabase
            .from("profiles")
            .insert(fallbackProfile);

          if (insertError) {
            console.error("Failed to provision DB profile:", insertError.message);
          }
          
          try {
            localStorage.setItem(localKey, JSON.stringify(fallbackProfile));
          } catch (e) {
            console.error(e);
          }
        } else {
          // Profile exists in DB - update stats
          const dbProfile: UserProfile = {
            id: profileData.id,
            display_name: profileData.display_name || emailPrefix,
            referral_code: profileData.referral_code || cleanCode,
            referrals_count: Number(profileData.referrals_count ?? 0),
            earnings: Number(profileData.earnings ?? 0),
            conversion_rate: Number(profileData.conversion_rate ?? 0),
            global_rank: Number(profileData.global_rank ?? 8),
          };

          if (active) {
            setProfile(dbProfile);
          }

          try {
            localStorage.setItem(localKey, JSON.stringify(dbProfile));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error("Error loading user profile stats from Supabase:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuthAndFetchProfile();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <p className="text-xs text-[var(--ink-500)] font-medium">Verifying partner session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--paper)]">
      <DashboardSidebar active={tab} onChange={setTab} profile={profile} />

      <div className="flex-1 min-w-0">
        <MobileTopBar active={tab} onChange={setTab} />

        <div className="px-5 md:px-8 py-8 md:py-10 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-10 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 chip chip-accent mb-4">
                <span className="pulse-dot pulse-emerald" />
                Partner Dashboard
              </div>
              <h1 className="font-display text-3xl md:text-5xl text-[var(--ink-950)] leading-[1.05] tracking-tight">
                Welcome back, <span className="word-serif">{profile?.display_name || "Partner"}</span>.
              </h1>
              <p className="mt-3 text-sm md:text-base text-[var(--ink-600)] max-w-xl">
                {profile && profile.global_rank <= 10 ? (
                  <>
                    You&apos;re ranked{" "}
                    <span className="text-[var(--ink-950)] font-medium">#{profile.global_rank}</span>{" "}
                    globally! You are in the top 10 and guaranteed a $25K funded account.
                  </>
                ) : (
                  <>
                    You&apos;re ranked{" "}
                    <span className="text-[var(--ink-950)] font-medium">#{profile?.global_rank || "999"}</span>{" "}
                    globally. You are{" "}
                    <span className="text-[var(--ink-950)] font-medium">
                      {Math.max(1, 50 - (profile?.referrals_count || 0))} referrals
                    </span>{" "}
                    away from the top 10 funded-account guarantee.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Promo banner */}
          <div className="mb-8 relative overflow-hidden rounded-2xl border border-[var(--ink-800)] bg-[var(--ink-950)] text-white px-6 py-4 flex items-center gap-4">
            <div
              aria-hidden
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[rgba(216,242,107,0.18)] blur-3xl pointer-events-none"
            />
            <div className="relative grid place-items-center w-9 h-9 rounded-lg bg-white/10 text-[#D8F26B] shrink-0">
              <Trophy className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <p className="relative text-sm text-white/85">
              <span className="text-white font-medium">Top 10 referrers</span>{" "}
              at launch receive a guaranteed{" "}
              <span className="text-[#D8F26B] font-medium">
                funded $25K account
              </span>{" "}
              — no evaluation required.
            </p>
          </div>

          {tab === "Overview" && (
            <>
              {/* Stats */}
              <AnimatedSection
                stagger
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              >
                <AnimatedItem>
                  <StatCard
                    icon={Users}
                    label="Total Referrals"
                    value={profile?.referrals_count || 0}
                    delta={profile ? undefined : { value: 12, positive: true }}
                  />
                </AnimatedItem>
                <AnimatedItem>
                  <StatCard
                    icon={DollarSign}
                    label="Total Earnings"
                    value={profile?.earnings || 0}
                    prefix="$"
                    accent
                    delta={profile ? undefined : { value: 28, positive: true }}
                  />
                </AnimatedItem>
                <AnimatedItem>
                  <StatCard
                    icon={Target}
                    label="Conversion Rate"
                    value={profile?.conversion_rate || 0}
                    suffix="%"
                    decimals={1}
                    delta={profile ? undefined : { value: 4, positive: true }}
                  />
                </AnimatedItem>
                <AnimatedItem>
                  <StatCard icon={Award} label="Global Rank" value={profile?.global_rank || 999} prefix="#" />
                </AnimatedItem>
              </AnimatedSection>

              {/* Link + tier */}
              <div className="grid lg:grid-cols-2 gap-5 mb-8">
                <ReferralLinkBox profile={profile} />
                <TierProgress current={profile?.referrals_count || 0} />
              </div>

              {/* Chart + leaderboard */}
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5 mb-8">
                <GrowthChart />
                <ActivityTimeline />
              </div>

              <Leaderboard profile={profile} />
            </>
          )}

          {tab === "Leaderboard" && (
            <div className="space-y-6">
              <Leaderboard profile={profile} />
            </div>
          )}

          {tab === "Rewards" && (
            <div className="space-y-6">
              <TierProgress current={profile?.referrals_count || 0} />
            </div>
          )}

          {tab === "Analytics" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-5">
                <GrowthChart />
                <ActivityTimeline />
              </div>
            </div>
          )}

          {tab === "Settings" && (
            <div className="surface-card p-8 text-center max-w-xl mx-auto mt-12">
              <h2 className="text-xl font-medium mb-3 text-[var(--ink-950)]">Account Settings</h2>
              <p className="text-[14px] text-[var(--ink-500)] mb-6">
                Manage your partner profile, payout methods, and notification preferences.
              </p>
              <div className="space-y-4 text-left border-t border-[var(--border)] pt-6">
                <div>
                  <label className="block text-[12px] font-medium text-[var(--ink-700)] mb-1">Partner ID</label>
                  <input type="text" readOnly value={`PARTNER-${profile?.id.substring(0, 8).toUpperCase() || "ID"}`} className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--paper-2)] text-[14px] text-[var(--ink-950)] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[var(--ink-700)] mb-1">Payout Method</label>
                  <input type="text" readOnly value="USDT (TRC-20) - Address Ending in ...7F82" className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--paper-2)] text-[14px] text-[var(--ink-950)] focus:outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}