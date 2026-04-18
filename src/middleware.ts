import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { landlordRoutes, tenantRoutesPrefix, managerRoutesPrefix } from "@/config/routes";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    // Handle /me as a hub route - redirect based on role
    const isMeRoute = nextUrl.pathname === "/me" || nextUrl.pathname.startsWith("/me/");

    if (isMeRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        if (userRole === 'LANDLORD') {
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        if (userRole === 'MANAGER') {
            return NextResponse.redirect(new URL('/manager/dashboard', nextUrl));
        }
        return NextResponse.next();
    }

    const isLandlordRoute = landlordRoutes.some(path =>
        nextUrl.pathname.startsWith(path) && !nextUrl.pathname.startsWith(tenantRoutesPrefix)
    );

    const isTenantRoute = nextUrl.pathname.startsWith(tenantRoutesPrefix);

    console.log(`[Middleware] Path: ${nextUrl.pathname}, Role: ${userRole}, IsLandlord: ${isLandlordRoute}, IsTenant: ${isTenantRoute}`);

    if (isLandlordRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/login', nextUrl));
        }
        if (userRole === 'MANAGER') {
            return NextResponse.redirect(new URL('/manager/dashboard', nextUrl));
        }
        if (userRole !== 'LANDLORD') {
            return NextResponse.redirect(new URL('/me', nextUrl));
        }
    }

    const isManagerRoute = nextUrl.pathname.startsWith(managerRoutesPrefix);
    if (isManagerRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (userRole === 'LANDLORD') return NextResponse.redirect(new URL('/dashboard', nextUrl));
        if (userRole !== 'MANAGER') return NextResponse.redirect(new URL('/me', nextUrl));
    }

    if (isTenantRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (userRole === 'LANDLORD') return NextResponse.redirect(new URL('/dashboard', nextUrl));
        if (userRole === 'MANAGER') return NextResponse.redirect(new URL('/manager/dashboard', nextUrl));
        if (userRole !== 'TENANT') return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
