import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);
    
    const { data: coupons, error } = await supabaseAdmin
      .from("tpp_coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ coupons: coupons || [] });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    const { code, discount_percentage, max_uses, expires_at, challenge_specific } = body;

    if (!code || discount_percentage === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCoupon = {
      code: code.toUpperCase(),
      discount_percentage,
      max_uses: max_uses || null,
      uses: 0,
      is_active: true,
      expires_at: expires_at || null,
      challenge_specific: challenge_specific || null
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
