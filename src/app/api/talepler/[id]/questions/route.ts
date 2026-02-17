import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth, getAdminUserId } from "@/auth"
import { validateContent } from "@/lib/content-filter"

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const listingId = (params.id || "").trim()
  if (!listingId) return NextResponse.json({ error: "listingId gerekli" }, { status: 400 })
  const qs = await prisma.question.findMany({
    where: { listingId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true } } }
  })
  return NextResponse.json(qs.map(q => ({
    id: q.id,
    body: q.body,
    answer: q.answer,
    answeredAt: q.answeredAt,
    createdAt: q.createdAt,
    user: { id: q.user?.id || null, name: q.user?.name || "Misafir" }
  })))
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  const listingId = (params.id || "").trim()
  if (!listingId) return NextResponse.json({ error: "listingId gerekli" }, { status: 400 })
  const bodyJson = await req.json().catch(() => ({}))
  const body = (bodyJson?.body as string || "").trim()
  if (!body) return NextResponse.json({ error: "body gerekli" }, { status: 400 })

  // Content Validation
  const validation = validateContent(body, { blockPrice: true });
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true, title: true }
  });

  if (!listing) return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 });

  // Prevent owner from asking
  if (userId && listing.ownerId === userId) {
    return NextResponse.json({ error: "Kendi talebinize soru soramazsınız." }, { status: 403 });
  }
  
  try {
    const created = await prisma.question.create({
      data: { listingId, userId: userId || null, body }
    })

    // Notify Listing Owner
    if (listing.ownerId !== userId) {
      await prisma.notification.create({
        data: {
          userId: listing.ownerId,
          type: "question",
          title: "Talebinize yeni bir soru geldi",
          body: `${listing.title} talebiniz için yeni bir soru: "${body.slice(0, 50)}${body.length > 50 ? '...' : ''}"`,
          dataJson: JSON.stringify({ listingId, questionId: created.id })
        }
      });
    }

    return NextResponse.json({ id: created.id })
  } catch (error: any) {
    console.error("Question creation error:", error);
    return NextResponse.json({ error: "Soru oluşturulurken bir hata oluştu: " + (error.message || error) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });

  const listingId = (params.id || "").trim()
  const bodyJson = await req.json().catch(() => ({}))
  const { questionId, answer } = bodyJson;

  if (!questionId || !answer) return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });

  // Content Validation for Answer
  const validation = validateContent(answer, { blockPrice: true });
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Verify ownership
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true, title: true }
  });

  if (!listing || listing.ownerId !== userId) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
  }

  const updatedQuestion = await prisma.question.update({
    where: { id: questionId },
    data: { answer, answeredAt: new Date() }
  });

  // Notify Question Asker (if registered user)
  if (updatedQuestion.userId) {
    await prisma.notification.create({
      data: {
        userId: updatedQuestion.userId,
        type: "answer",
        title: "Sorunuz cevaplandı",
        body: `${listing.title} talebindeki sorunuza cevap verildi: "${answer.slice(0, 50)}${answer.length > 50 ? '...' : ''}"`,
        dataJson: JSON.stringify({ listingId, questionId })
      }
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const listingId = (params.id || "").trim();
  if (!listingId) return NextResponse.json({ error: "listingId gerekli" }, { status: 400 });

  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const questionId = (searchParams.get("questionId") || searchParams.get("id") || "").trim();
  if (!questionId) return NextResponse.json({ error: "questionId gerekli" }, { status: 400 });

  const question = await prisma.question.findUnique({ where: { id: questionId }, select: { listingId: true } });
  if (!question) return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
  if (question.listingId !== listingId) return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });

  await prisma.question.delete({ where: { id: questionId } });
  return NextResponse.json({ success: true });
}
