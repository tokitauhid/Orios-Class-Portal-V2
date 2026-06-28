import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Pre-flight check: ensure the service role key is actually configured
function checkServiceKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key === "placeholder") {
    return NextResponse.json(
      { error: "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Please add it as a secret in your Cloudflare dashboard." },
      { status: 503 }
    );
  }
  return null;
}

// Helper function to verify super_admin role
async function checkSuperAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    return { authorized: false, errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { authorized: true, user };
}

// GET /api/admin/accounts - Get list of administrator profiles
export async function GET() {
  const serviceKeyCheck = checkServiceKey();
  if (serviceKeyCheck) return serviceKeyCheck;

  const authCheck = await checkSuperAdmin();
  if (!authCheck.authorized) return authCheck.errorResponse;

  try {
    const adminClient = createAdminClient();
    const { data: profiles, error } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profiles);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/accounts - Create a new admin account
export async function POST(request) {
  const serviceKeyCheck = checkServiceKey();
  if (serviceKeyCheck) return serviceKeyCheck;

  const authCheck = await checkSuperAdmin();
  if (!authCheck.authorized) return authCheck.errorResponse;

  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Create user in Supabase Auth (this trigger handles inserting into public.profiles via hook)
    const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    });

    if (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    // 2. Fetch the newly created profile (created by the public.handle_new_user trigger)
    const { data: profile, error: profErr } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", authUser.user.id)
      .single();

    if (profErr) {
      // Fallback: If trigger wasn't finished or configured, insert profile manually
      const { data: fallbackProfile } = await adminClient
        .from("profiles")
        .upsert({ id: authUser.user.id, email, role })
        .select()
        .single();
      return NextResponse.json(fallbackProfile);
    }

    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/accounts - Update account role
export async function PUT(request) {
  const serviceKeyCheck = checkServiceKey();
  if (serviceKeyCheck) return serviceKeyCheck;

  const authCheck = await checkSuperAdmin();
  if (!authCheck.authorized) return authCheck.errorResponse;

  try {
    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Prevent demoting the active super_admin themselves
    if (id === authCheck.user.id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    // Update in profiles table
    const { data: updatedProfile, error } = await adminClient
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update role in user metadata in auth.users
    await adminClient.auth.admin.updateUserById(id, {
      user_metadata: { role },
    });

    return NextResponse.json(updatedProfile);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/accounts - Delete an admin account
export async function DELETE(request) {
  const serviceKeyCheck = checkServiceKey();
  if (serviceKeyCheck) return serviceKeyCheck;

  const authCheck = await checkSuperAdmin();
  if (!authCheck.authorized) return authCheck.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    if (id === authCheck.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Delete user from auth.users (cascades to public.profiles)
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
