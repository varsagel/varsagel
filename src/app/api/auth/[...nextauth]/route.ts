export const runtime = "nodejs";
import { GET as AuthGET, POST as AuthPOST } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // console.log("Auth GET Cookie Check:", req.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`));
  return AuthGET(req);
}

export async function POST(req: NextRequest) {
  // console.log("Auth POST Cookie Check:", req.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`));
  return AuthPOST(req);
}
