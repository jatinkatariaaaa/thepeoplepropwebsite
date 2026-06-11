import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
