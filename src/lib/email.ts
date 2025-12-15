import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const DEFAULT_FROM = '"Varsagel" <info@varsagel.com>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // If SMTP creds are missing, just log (for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('--- MOCK EMAIL SEND ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html);
    console.log('-----------------------');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://varsagel.com';

export const emailTemplates = {
  listingPublished: (userName: string, listingTitle: string, listingId: string) => `
    <h2>Talebiniz Yayında!</h2>
    <p>Merhaba ${userName},</p>
    <p>"<strong>${listingTitle}</strong>" başlıklı talebiniz incelendi ve yayına alındı.</p>
    <p>Talebinizi görüntülemek için: <a href="${SITE_URL}/talep/${listingId}">Tıklayın</a></p>
    <br>
    <p>Varsagel Ekibi</p>
  `,
  offerReceived: (ownerName: string, listingTitle: string, offerPrice: number, listingId: string) => `
    <h2>Yeni Teklif Aldınız!</h2>
    <p>Merhaba ${ownerName},</p>
    <p>"<strong>${listingTitle}</strong>" talebiniz için <strong>${offerPrice.toLocaleString('tr-TR')} TL</strong> tutarında yeni bir teklif aldınız.</p>
    <p>Teklifi incelemek ve yanıtlamak için profilinize gidin.</p>
    <br>
    <p>Varsagel Ekibi</p>
  `,
  offerStatusChanged: (offererName: string, listingTitle: string, status: 'ACCEPTED' | 'REJECTED', listingId: string) => `
    <h2>Teklif Durumu Güncellendi</h2>
    <p>Merhaba ${offererName},</p>
    <p>"<strong>${listingTitle}</strong>" talebi için verdiğiniz teklif <strong>${status === 'ACCEPTED' ? 'KABUL EDİLDİ ✅' : 'REDDEDİLDİ ❌'}</strong>.</p>
    <p>Talep sahibiyle iletişime geçmek için talep sayfasına gidebilirsiniz: <a href="${SITE_URL}/talep/${listingId}">Talebe Git</a></p>
    <br>
    <p>Varsagel Ekibi</p>
  `,
  listingReminder: (userName: string, listingTitle: string, listingId: string) => `
    <h2>Talebiniz Hala Güncel mi?</h2>
    <p>Merhaba ${userName},</p>
    <p>"<strong>${listingTitle}</strong>" talebiniz 1 aydır yayında. Talebiniz hala güncelse herhangi bir işlem yapmanıza gerek yoktur.</p>
    <p>Eğer ihtiyacınızı karşıladıysanız veya talebi kaldırmak istiyorsanız aşağıdaki bağlantıdan talebinizi yönetebilirsiniz:</p>
    <p><a href="${SITE_URL}/talep/${listingId}">Talebe Git</a></p>
    <br>
    <p>Varsagel Ekibi</p>
  `,
  verificationEmail: (to: string, token: string) => `
    <h2>E-posta Adresinizi Doğrulayın</h2>
    <p>Merhaba,</p>
    <p>Varsagel hesabınızı doğrulamak için lütfen aşağıdaki bağlantıya tıklayın:</p>
    <p><a href="${SITE_URL}/auth/verify?token=${token}">E-postamı Doğrula</a></p>
    <p>Bu bağlantı 24 saat geçerlidir.</p>
    <br>
    <p>Varsagel Ekibi</p>
  `
};

export async function sendVerificationEmail(to: string, token: string) {
  const subject = "E-posta Adresinizi Doğrulayın";
  const html = emailTemplates.verificationEmail(to, token);
  await sendEmail({ to, subject, html });
}
