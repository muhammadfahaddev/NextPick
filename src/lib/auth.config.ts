import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/predictions", "/leaderboard"];
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p)
      );
      if (isProtected) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Providers added only in auth.ts (Node.js runtime)
};
