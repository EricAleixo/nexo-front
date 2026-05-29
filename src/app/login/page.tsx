"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F] px-4">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)",
          filter: "blur(60px)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Back to home */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-1.5 text-xs text-zinc-600 transition hover:text-zinc-400"
        >
          <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para o início
        </Link>

        <div className="rounded-2xl border border-indigo-500/10 bg-white/[.03] p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1
              className="text-4xl font-black tracking-tighter"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: "linear-gradient(135deg, #fff 30%, #a5b4fc 70%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QUIZ<span style={{ WebkitTextFillColor: "#6366f1" }}>ZY</span>
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">Entre na sua conta</p>
          </div>

          {/* Hint for mock */}
          <div className="mb-5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-center text-[11px] text-amber-400">
            🧪 Mock — tente: <strong>rafael_dev</strong>, <strong>ana_quiz</strong> ou <strong>leo_mota</strong>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400" htmlFor="username">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu_usuario"
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none ring-0 transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400" htmlFor="password">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-[11px] text-zinc-600 hover:text-indigo-400 transition"
                >
                  Esqueceu?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none ring-0 transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[.98]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {loading ? (
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                "Entrar →"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-xs text-zinc-600">
            Não tem conta?{" "}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
              Criar agora
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}