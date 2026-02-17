import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminUserId } from "@/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (process.env.NODE_ENV === "production" && process.env.ENABLE_ADMIN_DEPLOY !== "true") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target") === "staging" ? "staging" : "production";
    const logPath = path.join(process.cwd(), "logs", `deploy-${target}.log`);

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: "No deployment logs found." });
    }

    const logs = fs.readFileSync(logPath, "utf-8");
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}
