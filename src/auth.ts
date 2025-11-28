import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import bcrypt from "bcrypt";

const providers = [] as any[];
if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
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
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
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
  },
});