import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { landlordRoutes, tenantRoutesPrefix } from "@/config/routes";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    const isLandlordRoute = landlordRoutes.some(path =>
        nextUrl.pathname.startsWith(path) && !nextUrl.pathname.startsWith(tenantRoutesPrefix)
    );

    const isTenantRoute = nextUrl.pathname.startsWith(tenantRoutesPrefix);

    console.log(`[Middleware] Path: ${nextUrl.pathname}, Role: ${userRole}, IsLandlord: ${isLandlordRoute}, IsTenant: ${isTenantRoute}`);

    if (isLandlordRoute) {
        if (!isLoggedIn) {
            console.log('[Middleware] Redirecting to /login (not logged in)');
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        if (userRole !== 'LANDLORD') {
            console.log('[Middleware] Redirecting to /me (not landlord)');
            return NextResponse.redirect(new URL('/me', nextUrl));
        }
    }

    if (isTenantRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (userRole !== 'TENANT') {
            console.log('[Middleware] Redirecting to /dashboard (not tenant)');
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
