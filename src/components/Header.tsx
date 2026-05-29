import Link from "next/link";
import { LogoutButton } from "./LogoutButton";
import { authService } from "../services/auth.service";

export async function Header() {
  const user = await authService.getMe();

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/5 backdrop-blur-md bg-[#0A0A0F]/70">
      {/* ── Logo ── */}
      <Link
        href="/"
        className="text-xl font-black tracking-tighter"
        style={{
          fontFamily: "'Syne', sans-serif",
          background: "linear-gradient(135deg, #fff 30%, #a5b4fc 65%, #c084fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        QUIZ<span style={{ WebkitTextFillColor: "#6366f1" }}>ZY</span>
      </Link>

      {/* ── Auth area ── */}
      <div className="flex items-center gap-3">
        {user ? (
          /* ── Logged in ── */
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative size-8 rounded-full overflow-hidden border border-indigo-500/40 bg-indigo-500/20 flex items-center justify-center">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-indigo-300 select-none">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              )}
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 border border-[#0A0A0F]" />
            </div>

            {/* Username */}
            <span className="hidden sm:block text-sm font-semibold text-zinc-200">
              {user.username}
            </span>

            {/* Logout — client island */}
            <LogoutButton />
          </div>
        ) : (
          /* ── Logged out ── */
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white rounded-lg px-4 py-1.5 transition-all"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
              }}
            >
              Criar conta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}