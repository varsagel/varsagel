import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'auth-debug.log');
function fileLog(...args: any[]) {
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
console.log("Auth Config Debug:");

console.log("GOOGLE_ID present:", !!process.env.GOOGLE_ID);
if (process.env.GOOGLE_ID) console.log("GOOGLE_ID length:", process.env.GOOGLE_ID.length, "First char:", process.env.GOOGLE_ID[0], "Last char:", process.env.GOOGLE_ID.slice(-1));
console.log("GOOGLE_SECRET present:", !!process.env.GOOGLE_SECRET);
if (process.env.GOOGLE_SECRET) console.log("GOOGLE_SECRET length:", process.env.GOOGLE_SECRET.length);
console.log("AUTH_SECRET present:", !!process.env.AUTH_SECRET);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("AUTH_URL:", process.env.AUTH_URL);


if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
  console.warn("GOOGLE_ID or GOOGLE_SECRET is missing from environment variables.");
}

providers.push(
  Google({
      clientId: (process.env.GOOGLE_ID ?? "").replace(/"/g, '').trim(),
      clientSecret: (process.env.GOOGLE_SECRET ?? "").replace(/"/g, '').trim(),
    })
);

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
  adapter: PrismaAdapter(prisma),
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
      console.log("NextAuth Debug:", code, message);
    },
  },

  cookies: {
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
  },
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async signIn({ account, profile }) {
      fileLog("SignIn Callback triggered", { provider: account?.provider, accountId: account?.providerAccountId });
      if (account?.provider === "google") return true;
      return true;
    },
    async session({ session, token }) {
      // fileLog("Session Callback", { userId: session.user?.id });
      if (token) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      const host = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || baseUrl || "").replace(/\/$/, "");
      try {
        const u = new URL(url, baseUrl);
        if (u.pathname.startsWith("/api/auth")) return `${host}/`;
        return `${host}/`;
      } catch {
        return `${host}/`;
      }
    },
  },
});
