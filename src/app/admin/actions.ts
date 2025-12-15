"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/email";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Yetkisiz işlem");
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if ((user?.role || '').toUpperCase() !== 'ADMIN') throw new Error("Erişim engellendi");
  return user;
}

export async function approveListing(id: string) {
  await checkAdmin();
  await prisma.listing.update({ where: { id }, data: { status: "OPEN" } });
  
  const listing = await prisma.listing.findUnique({ where: { id }, include: { owner: true } });
  if (listing?.owner?.email) {
    await sendEmail({
      to: listing.owner.email,
      subject: `Talebiniz Yayında: ${listing.title}`,
      html: emailTemplates.listingPublished(listing.owner.name || 'Kullanıcı', listing.title, listing.id)
    });
  }

  revalidatePath("/admin/talepler");
  revalidatePath("/");
  return { success: true };
}

export async function rejectListing(id: string) {
  await checkAdmin();
  await prisma.listing.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/talepler");
  return { success: true };
}

export async function deleteListing(id: string) {
  await checkAdmin();
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/admin/talepler");
  return { success: true };
}

export async function toggleUserRole(id: string) {
  await checkAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Kullanıcı bulunamadı");
  const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
  // Prevent removing own admin if super user logic exists, but simplistic for now
  if (user.email === 'varsagel.com@gmail.com') return { success: false, error: "Süper yönetici rolü değiştirilemez" };
  await prisma.user.update({ where: { id }, data: { role: newRole } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  await checkAdmin();
  const user = await prisma.user.findUnique({ where: { id } });
  if (user?.email === 'varsagel.com@gmail.com') return { success: false, error: "Süper yönetici silinemez" };
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteOffer(id: string) {
  await checkAdmin();
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/admin/offers");
  return { success: true };
}

export async function resolveReport(id: string) {
  await checkAdmin();
  await prisma.report.update({ where: { id }, data: { status: "RESOLVED" } });
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function deleteReport(id: string) {
  await checkAdmin();
  await prisma.report.delete({ where: { id } });
  revalidatePath("/admin/reports");
  return { success: true };
}
