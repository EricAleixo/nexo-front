"use client";

import {
  useState,
  useEffect,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";

// ─── Toast ─────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export function Toast({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={[
            "flex cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3",
            "text-sm font-semibold shadow-xl backdrop-blur-md transition-all",
            "animate-in fade-in slide-in-from-bottom-2",
            t.type === "success"
              ? "border-emerald-200 bg-white text-emerald-700"
              : t.type === "error"
              ? "border-red-200 bg-white text-red-600"
              : "border-blue-200 bg-white text-blue-700",
          ].join(" ")}
        >
          {t.type === "success" && (
            <svg className="size-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
          {t.type === "error" && (
            <svg className="size-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Countdown Overlay ─────────────────────────────────────────────────────────

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const numberVariants: Variants = {
  enter: { scale: 1.6, opacity: 0, filter: "blur(8px)" },
  center: {
    scale: 1, opacity: 1, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 18 },
  },
  exit: { scale: 0.6, opacity: 0, filter: "blur(6px)", transition: { duration: 0.2 } },
};

const goVariants: Variants = {
  enter: { scale: 0.4, opacity: 0, letterSpacing: "-0.1em" },
  center: {
    scale: 1, opacity: 1, letterSpacing: "0.06em",
    transition: { type: "spring", stiffness: 260, damping: 14 },
  },
  exit: { scale: 1.2, opacity: 0, transition: { duration: 0.25 } },
};

const labelVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const shockwaveVariants: Variants = {
  animate: (delay: number) => ({
    scale: [0.8, 3.5],
    opacity: [0.7, 0],
    transition: {
      duration: 0.9,
      delay,
      ease: [0.2, 0.8, 0.4, 1] as [number, number, number, number],
    },
  }),
};

function ProgressRing({ count }: { count: number }) {
  const CIRCUMFERENCE = 2 * Math.PI * 45;
  const progress = useMotionValue(CIRCUMFERENCE);
  const strokeDashoffset = useTransform(progress, (v) => v);

  useEffect(() => {
    progress.set(CIRCUMFERENCE);
    const controls = animate(progress, 0, { duration: 1, ease: "linear" });
    return controls.stop;
  }, [count, CIRCUMFERENCE, progress]);

  return (
    <svg aria-hidden width="200" height="200" viewBox="0 0 96 96" className="absolute">
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="45" fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="3" />
      <motion.circle
        cx="48" cy="48" r="45" fill="none" stroke="url(#arcGrad)" strokeWidth="3"
        strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
        style={{ strokeDashoffset, rotate: -90, originX: "48px", originY: "48px" }}
      />
    </svg>
  );
}

export function CountdownOverlay({ count }: { count: number }) {
  const isGo = count === 0;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{ background: "rgba(15, 23, 42, 0.97)" }}
      >
        {/* Grid */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(59,130,246,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.07) 1px, transparent 1px)", backgroundSize: "56px 56px" }}
        />

        {/* Glow */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{ background: isGo ? "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(59,130,246,.2) 0%, transparent 70%)" : "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(59,130,246,.1) 0%, transparent 70%)" }}
          transition={{ duration: 0.5 }}
        />

        {/* Shockwaves */}
        {[0, 1].map((i) => (
          <motion.div
            key={`sw-${count}-${i}`}
            aria-hidden
            className="absolute rounded-full border border-blue-500/50"
            style={{ width: 200, height: 200 }}
            custom={i * 0.18}
            variants={shockwaveVariants}
            animate="animate"
          />
        ))}

        {/* Progress ring */}
        <AnimatePresence>
          {!isGo && (
            <motion.div key="ring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProgressRing count={count} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center content */}
        <div className="relative flex select-none flex-col items-center gap-6">
          <AnimatePresence mode="popLayout">
            {isGo ? (
              <motion.span
                key="go"
                variants={goVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="font-black leading-none"
                style={{
                  fontSize: "clamp(5rem, 20vw, 9rem)",
                  letterSpacing: "0.06em",
                  background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                GO!
              </motion.span>
            ) : (
              <motion.span
                key={count}
                variants={numberVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="font-black tabular-nums leading-none"
                style={{
                  fontSize: "clamp(5rem, 20vw, 9rem)",
                  background: "linear-gradient(160deg, #ffffff 30%, rgba(59,130,246,.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={isGo ? "go-label" : "cd-label"}
              variants={labelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/80"
            >
              {isGo ? "Boa sorte a todos!" : "A partida vai começar"}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence>
            {!isGo && (
              <motion.div
                key="pips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1 flex items-center gap-2"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <motion.span
                    key={n}
                    className="h-1.5 rounded-full"
                    animate={{
                      width: n === count ? 20 : 6,
                      background: n === count
                        ? "linear-gradient(90deg, #3b82f6, #6366f1)"
                        : n < count
                        ? "rgba(59,130,246,0.5)"
                        : "rgba(71,85,105,0.6)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}