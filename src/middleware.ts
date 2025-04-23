// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  // 1) Let Clerk do its thing (populates getAuth, handles redirects, etc.)
  const res = await clerkMiddleware()(req, ev);
  
  // 2) On _every_ response—pages, API, AND static assets—inject isolation headers:
  if (res && typeof res === 'object' && 'headers' in res) {
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    res.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  }

  return res;
}

// Match literally _everything_ (no exclusions), so your JS bundles, images,
// fonts, pages, APIs—absolutely all—pass through this middleware.
export const config = {
  matcher: "/:path*",
};
