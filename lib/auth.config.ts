// lib/auth.config.ts
import type { NextAuthConfig } from 'next-auth';

// Edge-safe config. Do NOT import prisma, bcryptjs, or pg here —
// this file is loaded by middleware, which runs in the Edge Runtime.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  providers: [], // Real providers are added in lib/auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'CUSTOMER' | 'DESIGNER' | 'ADMIN';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;