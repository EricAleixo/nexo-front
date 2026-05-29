"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/AuthContext";

export default function SignupPage() {

  const { signup } = useAuth();

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password || !confirm) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Usuário só pode ter letras, números e _");
      return;
    }

    setLoading(true);
    try {
      await signup(username.trim(), email.trim(), password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 py-12">
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
          background: "radial-gradient(ellipse, #a855f7 0%, #6366f1 50%, transparent 80%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 w-[350px] h-[250px] opacity-10"
        style={{
          background: "radial-gradient(ellipse, #06b6d4 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back */}
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
            <p className="mt-1.5 text-sm text-zinc-500">Crie sua conta gratuita</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400" htmlFor="username">
                Nome de usuário
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
                  @
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu_usuario"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-8 pr-4 text-sm text-zinc-200 placeholder-zinc-700 outline-none ring-0 transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none ring-0 transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none ring-0 transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="flex gap-1 pt-0.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-0.5 flex-1 rounded-full transition-all ${
                        password.length >= i * 3
                          ? i <= 1
                            ? "bg-red-500"
                            : i <= 2
                            ? "bg-amber-400"
                            : i <= 3
                            ? "bg-indigo-400"
                            : "bg-emerald-400"
                          : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400" htmlFor="confirm">
                Confirmar senha
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="repita a senha"
                className={`rounded-xl border bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none ring-0 transition focus:ring-1 ${
                  confirm && confirm !== password
                    ? "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20"
                    : "border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                }`}
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
                "Criar conta →"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-xs text-zinc-600">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
              Entrar agora
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}