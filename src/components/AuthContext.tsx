"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../lib/mock";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulates an async auth call — swap for real fetch() later
  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("http://192.168.1.110:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 🔥 necessário pro cookie JWT
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Erro ao fazer login");
    }

    //http://192.168.1.110:3000 retorna: { ok: true, data: { user, token } }
    const user = data.data.user;

    setUser(user);
  }, []);

  const signup = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await fetch("http://192.168.1.110:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Erro ao criar conta");
      }

      //back end já retorna: { ok: true, data: { user, token } }
      const user = data.data.user;

      setUser(user);
    },
    []
  );

  const logout = useCallback(() => setUser(null), []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("http://192.168.1.110:3000/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.data);
      console.log(data.data.username)
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}