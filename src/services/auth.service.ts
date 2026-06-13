import { cookies } from "next/headers";
import { User } from "../lib/mock";

class AuthService {
  async getMe(): Promise<User | null> {
    try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      const res = await fetch("http://192.168.1.110:3000/auth/me", { // ✅ IP direto
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });

      if (!res.ok) return null;
      const data = await res.json();
      return (data?.data as User) ?? null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();