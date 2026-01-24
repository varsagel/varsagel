import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";
import fs from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';
const enableAuthFileLog = !isProd && process.env.AUTH_DEBUG_LOG === '1';

const logFile = path.join(process.cwd(), 'auth-debug.log');
function fileLog(...args: any[]) {
  if (!enableAuthFileLog) return;
  try {
    const msg = new Date().toISOString() + ' ' + args.map(a => 
      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
    ).join(' ') + '\n';
    fs.appendFileSync(logFile, msg);
  } catch (e) {
    console.error("Failed to write to log file", e);
  }
}

const providers = [] as any[];

fileLog("Auth Config Loading...");
if (!isProd) {
  console.log("Auth Config Debug:");
  console.log("GOOGLE_ID present:", !!process.env.GOOGLE_ID);
  console.log("GOOGLE_SECRET present:", !!process.env.GOOGLE_SECRET);
  console.log("AUTH_SECRET present:", !!process.env.AUTH_SECRET);
  console.log("NEXTAUTH_URL present:", !!process.env.NEXTAUTH_URL);
  console.log("AUTH_URL present:", !!process.env.AUTH_URL);
}


if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
  console.warn("GOOGLE_ID or GOOGLE_SECRET is missing from environment variables.");
} else {
  providers.push(
    Google({
        clientId: (process.env.GOOGLE_ID ?? "").replace(/"/g, '').trim(),
        clientSecret: (process.env.GOOGLE_SECRET ?? "").replace(/"/g, '').trim(),
      })
  );
}

providers.push(
  Credentials({
    name: "E-posta ile giriş",
    credentials: {
      email: { label: "E-posta", type: "email" },
      password: { label: "Şifre", type: "password" },
    },
    authorize: async (credentials) => {
      const email = (credentials?.email as string || "").toLowerCase().trim();
      const password = credentials?.password || "";
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return null;
      
      if (!user.emailVerified) {
        throw new Error("E-posta adresinizi doğrulamanız gerekmektedir.");
      }

      const ok = await bcrypt.compare(password as string, user.passwordHash as string);
      if (!ok) return null;
      return {
        id: user.id,
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        image: user.image ?? undefined,
      } as any;
    },
  })
);

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET?.trim(),
  trustHost: true,
  basePath: "/api/auth",
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, ...message) {
      fileLog("NextAuth Error:", code, message);
      console.error("NextAuth Error:", code, message);
    },
    warn(code, ...message) {
      fileLog("NextAuth Warn:", code, message);
      console.warn("NextAuth Warn:", code, message);
    },
    debug(code, ...message) {
      fileLog("NextAuth Debug:", code, message);
      if (!isProd) console.log("NextAuth Debug:", code, message);
    },
  },

  cookies: isProd
    ? {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        callbackUrl: {
          name: `__Secure-next-auth.callback-url`,
          options: {
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        csrfToken: {
          name: `__Secure-next-auth.csrf-token`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        pkceCodeVerifier: {
          name: `__Secure-next-auth.pkce.code_verifier`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        state: {
          name: `__Secure-next-auth.state`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
        nonce: {
          name: `__Secure-next-auth.nonce`,
          options: {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: true,
          },
        },
      }
    : undefined,
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async signIn({ account }) {
      fileLog("SignIn Callback triggered", { provider: account?.provider, accountId: account?.providerAccountId });
      if (account?.provider === "google") return true;
      return true;
    },
    async session({ session, token }) {
      // fileLog("Session Callback", { userId: session.user?.id });
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role || "USER";
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        const safeOrigin = new URL(baseUrl).origin;
        
        // Eğer callback URL'si varsa oraya yönlendir
        if (u.searchParams.has('callbackUrl')) {
          const callbackUrl = u.searchParams.get('callbackUrl');
          if (callbackUrl) {
            // Güvenlik kontrolü - sadece aynı domain'e yönlendir
            try {
              const callback = new URL(callbackUrl, baseUrl);
              if (callback.origin === safeOrigin) {
                return callback.href;
              }
            } catch {
              // Geçersiz callback URL, ana sayfaya yönlendir
            }
          }
        }
        
        // API auth endpoint'lerinden geliyorsa ana sayfaya
        if (u.pathname.startsWith("/api/auth")) return `${safeOrigin}/`;
        
        // Aynı domain içindeki URL'ye yönlendir
        if (u.origin === safeOrigin) {
          return u.href;
        }
        
        // Varsayılan olarak ana sayfaya
        return `${safeOrigin}/`;
      } catch {
        try {
          return `${new URL(baseUrl).origin}/`;
        } catch {
          return '/';
        }
      }
    },
  },
});

export async function getAdminUserId() {
  let session: any = null;
  try {
    session = await auth();
  } catch {
    return null;
  }
  const userId = session?.user?.id as string | undefined;
  if (!userId) return null;

  const sessionRole = String(session?.user?.role || '').toUpperCase();
  if (sessionRole && sessionRole !== 'ADMIN') return null;

  const g = globalThis as any;
  if (!g.__varsagel_admin_role_cache) {
    g.__varsagel_admin_role_cache = new Map<string, { isAdmin: boolean; expiresAt: number }>();
  }
  const cache: Map<string, { isAdmin: boolean; expiresAt: number }> = g.__varsagel_admin_role_cache;

  const cached = cache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.isAdmin ? userId : null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN';
  cache.set(userId, { isAdmin, expiresAt: Date.now() + 30_000 });
  return isAdmin ? userId : null;
}
