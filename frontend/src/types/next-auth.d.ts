import "next-auth";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "STAFF_LEAD" | "STAFF";
      staffLeadId?: string;
    };
  }
  interface User {
    role: "STAFF_LEAD" | "STAFF";
    staffLeadId?: string;
    backendToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    staffLeadId?: string;
    backendToken: string;
  }
}
