import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if we are trying to access admin pages
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionEmail = request.cookies.get("orios_session_email");
    const sessionRole = request.cookies.get("orios_session_role");

    // If session doesn't exist, redirect to login page
    if (!sessionEmail || !sessionRole) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // Role-based authorization for the admins management sub-route
    if (pathname.startsWith("/admin/admins")) {
      if (sessionRole.value !== "super_admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin"; // Redirect non-super-admin to dashboard
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
