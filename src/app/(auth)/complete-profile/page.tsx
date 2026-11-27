import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { CompleteProfileForm } from "./CompleteProfileForm";

export const metadata: Metadata = { title: "Complete your profile" };

export default async function CompleteProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabaseAdmin.from("profiles")
    .select("display_name, signup_details_pending")
    .eq("id", user.id)
    .single();
  if (error) throw new Error("Could not load your profile. Please try again.");
  if (!profile.signup_details_pending) redirect("/dashboard");

  const googleName = user.user_metadata.full_name;
  const name = profile.display_name || (typeof googleName === "string" ? googleName : "");
  return <CompleteProfileForm name={name.slice(0, 100)} />;
}
