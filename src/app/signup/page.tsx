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

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmMismatch = confirm.length > 0 && confirm !== password;

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
    <AuthPageLayout
      title="Criar conta"
      subtitle="Cadastre-se gratuitamente e comece a jogar."
      footer={
        <>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Entrar agora
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label className={modalLabelClass} htmlFor="username">
            Nome de usuário
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
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
              className={[modalInputClass(!!error), "pl-9"].join(" ")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={modalLabelClass} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className={modalInputClass(!!error)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={modalLabelClass} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            className={modalInputClass(!!error)}
          />
          {password.length > 0 && (
            <div className="flex gap-1 pt-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={[
                    "h-1 flex-1 rounded-full transition-all",
                    password.length >= i * 3
                      ? i <= 1
                        ? "bg-red-500"
                        : i <= 2
                          ? "bg-amber-400"
                          : i <= 3
                            ? "bg-blue-400"
                            : "bg-emerald-500"
                      : "bg-slate-200",
                  ].join(" ")}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className={modalLabelClass} htmlFor="confirm">
            Confirmar senha
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="repita a senha"
            className={modalInputClass(confirmMismatch || !!error)}
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
            "Criar conta"
          )}
        </button>
      </form>
    </AuthPageLayout>
  );
}
