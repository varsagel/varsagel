import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const logPath = path.join(process.cwd(), "logs", "deploy.log");

    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: "No deployment logs found." });
    }

    const logs = fs.readFileSync(logPath, "utf-8");
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}
