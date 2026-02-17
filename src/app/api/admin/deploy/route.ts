import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getAdminUserId } from "@/auth";
import { rateLimiters } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (process.env.NODE_ENV === "production" && process.env.ENABLE_ADMIN_DEPLOY !== "true") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rl = await rateLimiters.admin.checkLimit(request);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rl.remaining.toString(),
            "X-RateLimit-Reset": new Date(rl.resetTime).toISOString(),
          },
        },
      );
    }

    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const o = new URL(origin);
        if (o.host !== host) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const scriptPath = path.join(process.cwd(), "scripts", "deploy.ps1");

    const body = await request.json().catch(() => ({}));
    const target = body?.target === "staging" ? "staging" : "production";
    const allowed = ["deploy", "pull", "install", "build", "restart"];
    const action = allowed.includes(body?.action) ? body.action : "deploy";

    const child = spawn(
      "powershell.exe",
      ["-ExecutionPolicy", "Bypass", "-File", scriptPath, "-Target", target, "-Action", action],
      {
      detached: true,
      stdio: "ignore",
      cwd: process.cwd(),
      },
    );

    child.unref();

    return NextResponse.json({ success: true, message: "Deployment started in background." });
  } catch (error) {
    console.error("Deploy trigger error:", error);
    return NextResponse.json({ success: false, error: "Failed to start deployment" }, { status: 500 });
  }
}
