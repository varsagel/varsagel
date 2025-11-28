import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Auth.js için CORS headers ekle
  const response = NextResponse.next();
  
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // OPTIONS isteklerini handle et
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200 });
  }
  
  return response;
}

export const config = {
  matcher: [
    "/api/auth/:path*",
  ],
};