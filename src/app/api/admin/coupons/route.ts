import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import { isProgramKey } from "@/data/catalogue";
import { couponAccountKey, type CouponAccount, type CouponProgram } from "@/lib/coupon-eligibility";

async function getCouponPrograms(): Promise<CouponProgram[]> {
  const { data, error } = await supabaseAdmin
    .from("tpp_programs")
    .select("key, short_label, tpp_program_fees(account_size)")
    .eq("is_active", true)
    .order("created_at");
  if (error) throw error;

  return (data ?? []).filter((program) => isProgramKey(program.key))
    .map((program) => ({
      key: program.key,
      label: program.short_label || program.key,
      accountSizes: program.tpp_program_fees.map((fee) => Number(fee.account_size)).sort((a, b) => a - b),
    }))
    .filter((program) => program.accountSizes.length > 0);
}

function isCouponAccount(value: unknown): value is CouponAccount {
  if (!value || typeof value !== "object") return false;
  const { programKey, accountSize } = value as Partial<CouponAccount>;
  return typeof programKey === "string" && typeof accountSize === "number"
    && Number.isSafeInteger(accountSize) && accountSize > 0;
}

function couponErrorResponse(error: unknown) {
  const message = error && typeof error === "object" && "message" in error && typeof error.message === "string"
    ? error.message : "Could not manage coupons.";
  const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    await getAdminUser(request);
    
    const [{ data: coupons, error }, programs] = await Promise.all([
      supabaseAdmin.from("tpp_coupons").select("*").order("created_at", { ascending: false }),
      getCouponPrograms(),
    ]);

    if (error) throw error;

    return NextResponse.json({ coupons: coupons || [], programs });
  } catch (error) {
    return couponErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    const { code, discount_percentage, max_uses, expires_at, challenge_specific, eligible_accounts } = body;

    if (typeof code !== "string" || !code.trim() || discount_percentage === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const legacyProgram = typeof challenge_specific === "string" ? challenge_specific.trim() || null : null;
    let selectedAccounts: CouponAccount[] | null = null;
    if (eligible_accounts != null) {
      if (!Array.isArray(eligible_accounts) || !eligible_accounts.length || !eligible_accounts.every(isCouponAccount)) {
        return NextResponse.json({ error: "Select at least one valid program and account size." }, { status: 400 });
      }

      const programs = await getCouponPrograms();
      const sizesByProgram = new Map(programs.map((program) => [program.key, program.accountSizes]));
      if (eligible_accounts.some(({ programKey, accountSize }) =>
        !sizesByProgram.get(programKey)?.includes(accountSize) || (legacyProgram && programKey !== legacyProgram),
      )) {
        return NextResponse.json({ error: "One or more selected accounts are no longer available." }, { status: 400 });
      }

      const uniqueAccounts = new Map<string, CouponAccount>();
      for (const { programKey, accountSize } of eligible_accounts) {
        const account = { programKey, accountSize };
        uniqueAccounts.set(couponAccountKey(account), account);
      }
      selectedAccounts = Array.from(uniqueAccounts.values());
    }

    const newCoupon = {
      code: code.trim().toUpperCase(),
      discount_pct: discount_percentage,
      max_uses: max_uses || null,
      current_uses: 0,
      is_active: true,
      expires_at: expires_at || null,
      challenge_specific: legacyProgram,
      ...(selectedAccounts && { eligible_accounts: selectedAccounts }),
    };

    const { data: coupon, error } = await supabaseAdmin
      .from("tpp_coupons")
      .insert(newCoupon)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
      throw error;
    }

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "create_coupon",
      entityType: "tpp_coupons",
      entityId: coupon.id,
      newValue: coupon,
      request
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return couponErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    const { id, is_active } = body;

    if (!id || is_active === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: oldCoupon } = await supabaseAdmin.from("tpp_coupons").select("*").eq("id", id).single();

    const { data: coupon, error } = await supabaseAdmin
      .from("tpp_coupons")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: is_active ? "activate_coupon" : "deactivate_coupon",
      entityType: "tpp_coupons",
      entityId: id,
      oldValue: oldCoupon,
      newValue: coupon,
      request
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return couponErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data: oldCoupon } = await supabaseAdmin.from("tpp_coupons").select("*").eq("id", id).single();

    const { error } = await supabaseAdmin
      .from("tpp_coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "delete_coupon",
      entityType: "tpp_coupons",
      entityId: id,
      oldValue: oldCoupon,
      request
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return couponErrorResponse(error);
  }
}
