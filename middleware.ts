import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
]);

const isReportRoute = createRouteMatcher(["/report(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();
  if (isReportRoute(req)) {
    if (!authData) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check for admin
    if (authData.orgRole !== "org:admin") {
      // Redirect non-admin users to homepage or access denied page
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else if (!isPublicRoute(req)) {
    // if (!auth().userId) {
    if (!authData) {
      // Redirect to sign-in page with return_to parameter
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Continue with the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
