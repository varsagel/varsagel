import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawQuery = (body?.query ?? "") as string;
    const categorySlug = (body?.categorySlug ?? null) as string | null;
    const matchModeRaw = (body?.matchMode ?? "TITLE") as string;
    const filters = (body?.filters ?? null) as any;

    const filtersObject =
      filters && typeof filters === "object" ? filters : null;
    const hasFilters =
      !!filtersObject && Object.keys(filtersObject).length > 0;

    const matchMode: "TITLE" | "CATEGORY" | "FILTERS" =
      matchModeRaw === "CATEGORY"
        ? "CATEGORY"
        : matchModeRaw === "FILTERS"
        ? "FILTERS"
        : "TITLE";

    const query = rawQuery ? rawQuery.trim() : "";

    if (!query && matchMode === "TITLE") {
      return NextResponse.json(
        { error: "Arama terimi en az 3 karakter olmalıdır" },
        { status: 400 }
      );
    }

    if (matchMode === "TITLE" && query.length < 3) {
      return NextResponse.json(
        { error: "Arama terimi en az 3 karakter olmalıdır" },
        { status: 400 }
      );
    }

    const existing = await prisma.savedSearch.findFirst({
      where: {
        userId: session.user.id,
        query,
        categorySlug: categorySlug || null,
        // matchMode is not a valid field in SavedSearchWhereInput, skip it here
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu arama zaten kayıtlı" },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        query,
        categorySlug: categorySlug || null,
// matchMode is not a valid field in SavedSearchCreateInput, skip it here
        // filters field does not exist in SavedSearchCreateInput; omit it
      },
    });

    return NextResponse.json(savedSearch);
  } catch (error: any) {
    console.error("SavedSearch error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu: " + (error?.message || "Bilinmeyen hata") },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const categorySlug = searchParams.get("categorySlug");

    const where: any = {
      userId: session.user.id,
    };

    if (query) {
      where.query = query;
    }

    if (categorySlug) {
      where.categorySlug = categorySlug;
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(savedSearches);
  } catch (error) {
    console.error("SavedSearch error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 });
    }

    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
    }

    if (savedSearch.userId !== session.user.id) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SavedSearch delete error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
