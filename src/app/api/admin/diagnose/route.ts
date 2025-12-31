import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logErrorToDb } from "@/lib/logger-service";

// Force rebuild comment - version 5
export async function POST(req: Request) {
  try {
    const session = await auth();
    // @ts-ignore
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      database: { status: 'pending', message: '' },
      env: { status: 'pending', message: '' },
      api: { status: 'pending', message: '' }
    };

    // 1. Database Check
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database = { status: 'ok', message: 'Veritabanı bağlantısı başarılı.' };
    } catch (dbError: any) {
      results.database = { status: 'error', message: `Veritabanı hatası: ${dbError.message}` };
      await logErrorToDb({
        message: 'Diagnostic DB Fail',
        stack: dbError instanceof Error ? dbError.stack : String(dbError),
        source: 'backend',
        context: { error: dbError }
      });
    }

    // 2. Environment Variables Check
    const requiredEnv = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    const missingEnv = requiredEnv.filter(key => !process.env[key]);
    
    if (missingEnv.length === 0) {
      results.env = { status: 'ok', message: 'Kritik ortam değişkenleri mevcut.' };
    } else {
      results.env = { status: 'error', message: `Eksik değişkenler: ${missingEnv.join(', ')}` };
      await logErrorToDb({
        message: 'Diagnostic Env Fail',
        source: 'backend',
        context: { missingEnv }
      });
    }

    // 3. API Self-Check (Internal logic check)
    // Here we just confirm the runtime is executing logic correctly
    results.api = { status: 'ok', message: 'API servisi yanıt veriyor.' };

    return NextResponse.json({ 
      success: true, 
      results, 
      timestamp: new Date().toISOString() 
    });

  } catch (error: any) {
    console.error("Diagnostic error:", error);
    return NextResponse.json({ error: "Diagnostic scan failed" }, { status: 500 });
  }
}
