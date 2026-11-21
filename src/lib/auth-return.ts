/** Only return to this site; only checkout selection fields cross login. */
export function safeReturn(value: string | null) {
  if (!value?.startsWith("/") || /[\\\u0000-\u001f]/.test(value) || value.startsWith("//")) return "/dashboard";
  const origin = "https://return.invalid";
  const url = new URL(value, origin);
  if (url.origin !== origin || url.pathname.startsWith("//") || url.pathname === "/login" || url.pathname === "/signup") return "/dashboard";
  if (url.pathname !== "/dashboard/new-challenge") return url.pathname;
  const selection = new URLSearchParams();
  for (const field of ["program", "size", "addons", "platform", "promo"]) {
    const choice = url.searchParams.get(field);
    if (choice && choice.length <= 120) selection.set(field, choice);
  }
  return url.pathname + (selection.size ? "?" + selection : "");
}
