import { Header } from "../components/Header";
import { HomeActions } from "../components/homeActions";
import { RoomGrid } from "../components/RoomGrid";

export default async function Home() {

  return (
    <>
      <Header></Header>
      <main className="relative min-h-screen overflow-hidden bg-[#0A0A0F] flex flex-col items-center">
        {/* ── Animated grid background ── */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,.07) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* ── Glow blobs ── */}
        <div
          aria-hidden
          className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed bottom-0 left-0 w-100 h-75 opacity-10"
          style={{
            background: "radial-gradient(ellipse, #06b6d4 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* ── Hero section ── */}
        <section className="relative z-10 flex w-full flex-col items-center justify-center gap-10 px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-indigo-300 uppercase">
            <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Quiz ao Vivo
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-3">
            <h1
              className="text-6xl sm:text-8xl font-black tracking-tighter leading-none"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: "linear-gradient(135deg, #fff 30%, #a5b4fc 65%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QUIZ<span style={{ WebkitTextFillColor: "#6366f1" }}>ZY</span>
            </h1>
            <p className="max-w-sm text-sm sm:text-base text-zinc-400 leading-relaxed">
              Crie uma sala, compartilhe o código e desafie seus amigos em tempo real.
            </p>
          </div>

          {/* CTA buttons + auth state */}
          <HomeActions />

          <p className="text-xs text-zinc-600">
            Sem frescura. Só diversão.
          </p>
        </section>

        {/* ── Divider ── */}
        <div className="relative mb-8 flex w-full max-w-5xl items-center gap-4 px-4">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-700">
            Salas abertas agora
          </span>
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* ── Room grid ── */}
        <RoomGrid />
      </main>
    </>
  );
}