import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "SUPERADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "USER" | "SUPERADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "SUPERADMIN";
  }
}
