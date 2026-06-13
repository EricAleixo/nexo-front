"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPageLayout } from "@/src/components/auth/AuthPageLayout";
import { useAuth } from "@/src/components/AuthContext";
import {
  modalErrorBoxClass,
  modalInputClass,
  modalLabelClass,
  modalPrimaryButtonClass,
} from "@/src/components/ui/modalStyles";

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
    <AuthPageLayout
      title="Entrar"
      subtitle="Acesse sua conta para criar e gerenciar salas."
      footer={
        <>
          Não tem conta?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Criar agora
          </Link>
        </>
      }
    >
      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-xs text-amber-700">
        Mock — tente: <strong>rafael_dev</strong>, <strong>ana_quiz</strong> ou{" "}
        <strong>leo_mota</strong>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label className={modalLabelClass} htmlFor="username">
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
            className={modalInputClass(!!error)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className={modalLabelClass} htmlFor="password">
              Senha
            </label>
            <button
              type="button"
              className="text-xs font-medium text-slate-400 transition-colors hover:text-blue-600"
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
            className={modalInputClass(!!error)}
          />
        </div>

        {error && (
          <p className={[modalErrorBoxClass, "text-sm text-red-600"].join(" ")}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={modalPrimaryButtonClass(loading)}
        >
          {loading ? (
            <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
    </AuthPageLayout>
  );
}
