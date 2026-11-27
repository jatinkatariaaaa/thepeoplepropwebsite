"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function completeSignupProfile(_previousError: string | null, formData: FormData): Promise<string | null> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const rawName = formData.get("fullName");
  const fullName = typeof rawName === "string" ? rawName.normalize("NFC").trim().replace(/\s+/g, " ") : "";
  if (!fullName || fullName.length > 100) return "Enter your full name, using up to 100 characters.";

  const rawPhone = formData.get("phoneNumber");
  const phoneNumber = typeof rawPhone === "string" && rawPhone.length <= 40
    ? rawPhone.normalize("NFKC").replace(/[\s().-]+/g, "")
    : "";
  if (!/^\+[1-9][0-9]{6,14}$/.test(phoneNumber)) {
    return "Enter a mobile number with its country code, such as +91 98765 43210.";
  }

  const [firstName, ...remainingNames] = fullName.split(" ");
  const { error } = await supabaseAdmin.from("profiles")
    .update({
      display_name: fullName,
      first_name: firstName,
      last_name: remainingNames.join(" ") || null,
      phone_number: phoneNumber,
      signup_details_pending: false,
    })
    .eq("id", user.id)
    .eq("signup_details_pending", true);

  if (error) {
    console.error("Unable to save signup profile", error.code);
    return "Could not save your profile. Please try again.";
  }

  redirect("/dashboard");
}
