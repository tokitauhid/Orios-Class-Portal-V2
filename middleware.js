import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Gate all admin pages except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const { supabase, user, response } = await updateSession(request);

    // If session doesn't exist, redirect to login page
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // Fetch user profile role from public profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      // Clear invalid cookies by getting the response from updateSession
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      const redirectResponse = NextResponse.redirect(url);
      
      // Attempt to clear session cookies
      redirectResponse.cookies.delete("sb-access-token");
      redirectResponse.cookies.delete("sb-refresh-token");
      return redirectResponse;
    }

    // Role-based authorization for the admins management sub-route
    if (pathname.startsWith("/admin/admins")) {
      if (profile.role !== "super_admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin"; // Redirect non-super-admin to dashboard
        return NextResponse.redirect(url);
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
