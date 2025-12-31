import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(request: Request) {
  try {
    // In a real app, verify admin session here.
    // const session = await auth();
    // if (!session?.user?.isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const scriptPath = path.join(process.cwd(), "scripts", "deploy.ps1");
    
    // Spawn PowerShell script
    const child = spawn("powershell.exe", ["-ExecutionPolicy", "Bypass", "-File", scriptPath], {
      detached: true,
      stdio: "ignore", // We write to file in the script
      cwd: process.cwd(),
    });

    child.unref();

    return NextResponse.json({ success: true, message: "Deployment started in background." });
  } catch (error) {
    console.error("Deploy trigger error:", error);
    return NextResponse.json({ success: false, error: "Failed to start deployment" }, { status: 500 });
  }
}
