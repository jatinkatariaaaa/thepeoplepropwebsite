import { cookies } from "next/headers";
import { LEGACY_REF_COOKIES, REF_COOKIE } from "@/lib/referral-link";
import { LoginForm } from "./LoginForm";

/** Referral links land on ?mode=signup; the invite note shows while their cookie is set. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const store = await cookies();
  const invited = [REF_COOKIE, ...LEGACY_REF_COOKIES].some((name) => store.has(name));
  return <LoginForm initialMode={mode === "signup" ? "signup" : "signin"} invited={invited} />;
}
