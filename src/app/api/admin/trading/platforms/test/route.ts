import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { pingTerminal } from "@/lib/terminal-api";

export async function POST(req: Request) {
  try {
    const { platformId } = await req.json();

    if (!platformId) {
      return NextResponse.json({ error: "Platform ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    // Verify Admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      // Check admin roles
      const { data: adminRole } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
        
      if (!adminRole) {
         return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      }
    }

    // Fetch the platform details
    const { data: platform, error: platformError } = await supabase
      .from("tpp_platforms")
      .select("api_url, api_key")
      .eq("id", platformId)
      .single();

    if (platformError || !platform) {
      return NextResponse.json({ error: "Platform not found or database error" }, { status: 404 });
    }

    if (!platform.api_url || !platform.api_key) {
      return NextResponse.json({ error: "Platform API URL or Key is missing" }, { status: 400 });
    }

    // Ping the terminal
    const result = await pingTerminal(platform.api_url, platform.api_key);

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
