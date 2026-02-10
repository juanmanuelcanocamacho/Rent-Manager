import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    const isLandlordRoute = ['/dashboard', '/rooms', '/tenants', '/leases', '/invoices', '/messages'].some(path =>
        nextUrl.pathname.startsWith(path) && !nextUrl.pathname.startsWith('/me') // careful with prefix overlap if any
    );

    // Actually /messages vs /me/messages. 
    // '/messages' starts with '/messages'. '/me/messages' does NOT start with '/messages'.
    // But wait, if I have /messages, does check startWith match /messages-foo? Probably fine for now.

    const isTenantRoute = nextUrl.pathname.startsWith('/me');

    if (isLandlordRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        // Allow both LANDLORD and MANAGER
        if (userRole !== 'LANDLORD' && userRole !== 'MANAGER') {
            return NextResponse.redirect(new URL('/me', nextUrl));
        }
    }

    if (isTenantRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (userRole !== 'TENANT') {
            return NextResponse.redirect(new URL('/dashboard', nextUrl)); // Landlord trying to access tenant view?
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
