import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { newId } from "@/lib/id";

const providers = [
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = credentials.email.trim().toLowerCase();
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user || !user.passwordHash) return null;

      const valid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

// OAuth providers only register if their env vars are actually present, so
// the app runs fine with just email/password auth and you can add
// Google/Apple/Facebook later without touching any code.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  // APPLE_CLIENT_SECRET here is the short-lived signed JWT described in
  // BACKEND.md — generate it from your Team ID / Services ID / Key ID /
  // .p8 file, it is NOT a static string like the other providers' secrets.
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/register",
  },
  callbacks: {
    // For OAuth sign-ins, upsert into our own `users` table by email so
    // OAuth and credentials accounts share one row shape (no separate
    // adapter-managed accounts table).
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const [existing] = await db.select().from(users).where(eq(users.email, email));
      if (existing) {
        // Keep name/image fresh from the provider, don't touch passwordHash.
        await db
          .update(users)
          .set({ name: user.name ?? existing.name, image: user.image ?? existing.image })
          .where(eq(users.id, existing.id));
        user.id = existing.id;
      } else {
        const id = newId();
        await db.insert(users).values({
          id,
          name: user.name ?? email,
          email,
          image: user.image ?? null,
          provider: account.provider,
        });
        user.id = id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id;
      return session;
    },
  },
};
