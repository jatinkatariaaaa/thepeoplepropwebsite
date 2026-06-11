import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if the user wants to generate an affiliate code
    if (body.action === 'generate_affiliate') {
      const affiliateCode = `tpp_${user.id.substring(0, 6)}`;
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ affiliate_code: affiliateCode })
        .eq("id", user.id);
        
      if (error) throw error;
      return NextResponse.json({ success: true, affiliateCode });
    }

    // Standard profile update
    const { 
      title, 
      firstName, 
      lastName, 
      dob, 
      timezone, 
      street, 
      city, 
      postalCode, 
      country 
    } = body;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        title,
        first_name: firstName,
        last_name: lastName,
        dob,
        timezone,
        street,
        city,
        postal_code: postalCode,
        country
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Profile updated successfully." });

  } catch (err: any) {
    console.error("Settings Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
