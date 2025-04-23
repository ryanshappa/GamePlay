// // src/middleware.headers.ts
// import { NextResponse, type NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
//   res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
//   res.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
//   return res;
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };
