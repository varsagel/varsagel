import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET(request: Request) {
  // Simple security check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'varsagel_cron_secret'}`) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });
  }

  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const listings = await prisma.listing.findMany({
      where: {
        status: "OPEN",
        createdAt: {
          lte: oneMonthAgo,
        },
        reminderSentAt: null,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      take: 20, // Process in small batches
    });

    const results = [];

    for (const listing of listings) {
      if (listing.owner.email) {
        // Send email
        await sendEmail({
          to: listing.owner.email,
          subject: "Talebiniz Hakkında Hatırlatma",
          html: emailTemplates.listingReminder(listing.owner.name || "Kullanıcı", listing.title, listing.id),
        });

        // Update listing
        await prisma.listing.update({
          where: { id: listing.id },
          data: { reminderSentAt: new Date() },
        });

        results.push({ id: listing.id, status: "sent" });
      } else {
         results.push({ id: listing.id, status: "skipped_no_email" });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error("Cron hatası:", error);
    return NextResponse.json({ error: "Sunucu Hatası" }, { status: 500 });
  }
}
