export const runtime = "nodejs";
import { GET as AuthGET, POST as AuthPOST } from "@/auth";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest, props: { params: Promise<{ nextauth?: string[] }> }) {
  console.log("Auth GET hit:", req.url);
  const params = await props.params;
  const slug = params?.nextauth;
  console.log("Auth GET slug:", slug);
  
  if (!slug || slug.length === 0) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url, { status: 302 });
  }
  
  try {
    const res = await AuthGET(req);
    console.log("Auth GET response status:", res.status);
    return res;
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ nextauth?: string[] }> }) {
  console.log("Auth POST hit:", req.url);
  const params = await props.params;
  const slug = params?.nextauth;
  console.log("Auth POST slug:", slug);

  if (!slug || slug.length === 0) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url, { status: 302 });
  }

  try {
    return await AuthPOST(req);
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
