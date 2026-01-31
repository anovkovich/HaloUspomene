import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function verifyToken(token: string) {
  try {
    const secretKey = process.env.JWT_SECRET_KEY;

    // FIX: Check if secret exists before using it
    if (!secretKey || secretKey.length === 0) {
      console.error("❌ Middleware Error: JWT_SECRET is missing from .env");
      return false;
    }

    const secret = new TextEncoder().encode(secretKey);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const protectedRoutes = ["/profile"];
  const authRoutes = ["/login", "/signup"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.includes(path);

  // 1. Protected Routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const isValid = await verifyToken(token);
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // 2. Auth Routes (Prevent logged-in users from seeing login page)
  if (isAuthRoute && token) {
    const isValid = await verifyToken(token);
    if (isValid) {
      // Redirect to profile or dashboard if already logged in
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
