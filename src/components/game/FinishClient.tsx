"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy, Users, Target, HelpCircle, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, Clock, Crown, Star, BarChart3, ChevronRight,
  Medal, Flame, Zap, RefreshCw, Plus, Award,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
  id: string;
  title: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  title: string;
  order: number;
  options: Option[];
}

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  answeredCorrectly?: boolean;
}

interface Answer {
  id: string;
  playerId: string;
  questionId: string;
  optionId: string;
}

interface Props {
  code: string;
  players: Player[];
  questions: Question[];
  answersPerQuestion: Answer[][];
  currentPlayer: Player | null;
  currentIsHost: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-500", "bg-fuchsia-500", "bg-sky-500",
  "bg-emerald-500", "bg-rose-500", "bg-amber-500",
  "bg-indigo-500", "bg-teal-500",
];

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function getCorrectOptionId(question: Question): string {
  return question.options.find((o) => o.isCorrect)?.id ?? "";
}

function getCorrectRate(
  questionIndex: number,
  answersPerQuestion: Answer[][],
  questions: Question[],
  guestPlayers: Player[],
): number {
  if (guestPlayers.length === 0) return 0;
  const answers = answersPerQuestion[questionIndex] ?? [];
  const correctId = getCorrectOptionId(questions[questionIndex]);
  return answers.filter((a) => a.optionId === correctId).length / guestPlayers.length;
}

function getDifficultyConfig(rate: number) {
  if (rate >= 0.8) return {
    label: "Fácil",
    textColor: "text-emerald-400",
    bg: "bg-emerald-500/15 border border-emerald-500/25",
    barColor: "bg-emerald-400",
    icon: TrendingUp,
  };
  if (rate >= 0.4) return {
    label: "Média",
    textColor: "text-amber-400",
    bg: "bg-amber-500/15 border border-amber-500/25",
    barColor: "bg-amber-400",
    icon: Target,
  };
  return {
    label: "Difícil",
    textColor: "text-red-400",
    bg: "bg-red-500/15 border border-red-500/25",
    barColor: "bg-red-400",
    icon: TrendingDown,
  };
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  valueColor = "text-white",
  animated = false,
  numericValue,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  valueColor?: string;
  animated?: boolean;
  numericValue?: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-4 py-5 text-center flex flex-col items-center gap-2">
      <div className="size-8 rounded-xl bg-zinc-800/80 flex items-center justify-center">
        <Icon className="size-4 text-zinc-400" />
      </div>
      <p className={`text-2xl font-black tabular-nums leading-none ${valueColor}`}>
        {animated && numericValue !== undefined
          ? <AnimatedNumber value={numericValue} />
          : value
        }
      </p>
      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ─── Podium ───────────────────────────────────────────────────────────────────

function Podium({ players }: { players: Player[] }) {
  const sorted = [...players].filter((p) => !p.isHost).sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  if (top3.length === 0) return null;

  const positions =
    top3.length >= 3 ? [top3[1], top3[0], top3[2]]
    : top3.length === 2 ? [top3[1], top3[0]]
    : [top3[0]];

  const podiumConfig =
    top3.length >= 3
      ? [
          { height: "h-16", label: "2°", crown: false, ring: "ring-zinc-500/40", size: "size-12 text-lg", blockGradient: "from-zinc-600 to-zinc-700", rankColor: "text-zinc-400" },
          { height: "h-24", label: "1°", crown: true, ring: "ring-amber-400/70", size: "size-16 text-xl", blockGradient: "from-amber-400 to-amber-600", rankColor: "text-amber-400" },
          { height: "h-11", label: "3°", crown: false, ring: "ring-amber-700/40", size: "size-10 text-base", blockGradient: "from-amber-700 to-amber-900", rankColor: "text-amber-700" },
        ]
      : top3.length === 2
      ? [
          { height: "h-16", label: "2°", crown: false, ring: "ring-zinc-500/40", size: "size-12 text-lg", blockGradient: "from-zinc-600 to-zinc-700", rankColor: "text-zinc-400" },
          { height: "h-24", label: "1°", crown: true, ring: "ring-amber-400/70", size: "size-16 text-xl", blockGradient: "from-amber-400 to-amber-600", rankColor: "text-amber-400" },
        ]
      : [
          { height: "h-24", label: "1°", crown: true, ring: "ring-amber-400/70", size: "size-16 text-xl", blockGradient: "from-amber-400 to-amber-600", rankColor: "text-amber-400" },
        ];

  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-6 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Trophy className="size-4 text-amber-400" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Pódio</p>
      </div>
      <div className="flex items-end justify-center gap-4">
        {positions.map((player, vi) => {
          const cfg = podiumConfig[vi];
          return (
            <div key={player.id} className="flex flex-col items-center gap-2">
              <div className="relative">
                {cfg.crown && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Crown className="size-5 text-amber-400 fill-amber-400/30" />
                  </div>
                )}
                <div className={`${cfg.size} rounded-full ${getAvatarColor(player.name)} flex items-center justify-center font-black text-white ring-2 ${cfg.ring} shadow-lg`}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="text-xs font-bold text-zinc-400 max-w-[64px] truncate text-center">
                {player.name}
              </span>
              <span className={`text-xs font-black tabular-nums ${cfg.rankColor}`}>
                {player.score.toLocaleString()} pts
              </span>
              <div className={`w-20 ${cfg.height} rounded-t-xl bg-gradient-to-b ${cfg.blockGradient} flex items-center justify-center font-black text-white/80 text-sm`}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Score Row ────────────────────────────────────────────────────────────────

function ScoreRow({ player, rank, isMe }: { player: Player; rank: number; isMe: boolean }) {
  const rankMedals = [
    <Medal key="g" className="size-4 text-amber-400 fill-amber-400/20" />,
    <Medal key="s" className="size-4 text-zinc-400 fill-zinc-400/20" />,
    <Medal key="b" className="size-4 text-amber-700 fill-amber-700/20" />,
  ];

  return (
    <div className={[
      "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all",
      isMe ? "border-indigo-500/40 bg-indigo-500/10" : "border-zinc-800/60 bg-zinc-900/50",
    ].join(" ")}>
      <div className="w-6 shrink-0 flex items-center justify-center">
        {rank < 3
          ? rankMedals[rank]
          : <span className="text-xs font-black text-zinc-600 tabular-nums">#{rank + 1}</span>
        }
      </div>
      <span className={`size-8 rounded-full ${getAvatarColor(player.name)} flex items-center justify-center text-sm font-black text-white shrink-0`}>
        {player.name.charAt(0).toUpperCase()}
      </span>
      <span className="flex-1 text-sm font-semibold text-white truncate">
        {player.name}
        {isMe && (
          <span className="ml-2 text-[10px] font-black text-indigo-400 uppercase tracking-wider">você</span>
        )}
      </span>
      {player.answeredCorrectly !== undefined && (
        player.answeredCorrectly
          ? <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          : <XCircle className="size-4 text-red-400 shrink-0" />
      )}
      <span className="text-sm font-black text-indigo-400 tabular-nums shrink-0">
        {player.score.toLocaleString()} pts
      </span>
    </div>
  );
}

// ─── Question Stats Row ───────────────────────────────────────────────────────

function QuestionStatRow({ question, index, rate }: { question: Question; index: number; rate: number }) {
  const pct = Math.round(rate * 100);
  const diff = getDifficultyConfig(rate);
  const DiffIcon = diff.icon;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), index * 80 + 200);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-4 hover:border-zinc-700/60 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-6 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[10px] font-black text-zinc-500">{index + 1}</span>
        </div>
        <p className="flex-1 text-sm font-semibold text-zinc-300 leading-snug">{question.title}</p>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 ${diff.bg}`}>
          <DiffIcon className={`size-3 ${diff.textColor}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${diff.textColor}`}>{diff.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${diff.barColor} transition-all duration-700 ease-out`}
            style={{ width: animated ? `${pct}%` : "0%" }}
          />
        </div>
        <span className={`text-xs font-black tabular-nums shrink-0 w-10 text-right ${diff.textColor}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Host View ────────────────────────────────────────────────────────────────

function HostView({
  players,
  questions,
  answersPerQuestion,
}: {
  players: Player[];
  questions: Question[];
  answersPerQuestion: Answer[][];
}) {
  const guestPlayers = players.filter((p) => !p.isHost);
  const sorted = [...guestPlayers].sort((a, b) => b.score - a.score);

  const totalAnswers = answersPerQuestion.flat();
  const correctAnswers = answersPerQuestion.flatMap((answers, qi) => {
    const correctId = getCorrectOptionId(questions[qi]);
    return answers.filter((a) => a.optionId === correctId);
  });
  const globalRate = totalAnswers.length > 0
    ? Math.round((correctAnswers.length / totalAnswers.length) * 100)
    : 0;

  const questionStats = questions.map((q, i) => ({
    q, i,
    rate: getCorrectRate(i, answersPerQuestion, questions, guestPlayers),
  }));
  const sortedByRate = [...questionStats].sort((a, b) => a.rate - b.rate);
  const hardest = sortedByRate[0];
  const easiest = sortedByRate[sortedByRate.length - 1];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Users} label="Jogadores" animated numericValue={guestPlayers.length} />
        <StatCard icon={Target} label="Taxa de acerto" value={`${globalRate}%`} valueColor={globalRate >= 60 ? "text-emerald-400" : "text-amber-400"} />
        <StatCard icon={HelpCircle} label="Perguntas" animated numericValue={questions.length} />
      </div>

      <Podium players={players} />

      {questions.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                <Flame className="size-3.5 text-red-400" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-400">Mais difícil</p>
            </div>
            <p className="text-sm font-semibold text-zinc-300 leading-snug">{hardest?.q.title}</p>
            <div className="flex items-center justify-between">
              <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden mr-3">
                <div className="h-full rounded-full bg-red-400 transition-all duration-700" style={{ width: `${Math.round((hardest?.rate ?? 0) * 100)}%` }} />
              </div>
              <span className="text-xs font-black text-red-400 tabular-nums shrink-0">{Math.round((hardest?.rate ?? 0) * 100)}% acerto</span>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Zap className="size-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Mais fácil</p>
            </div>
            <p className="text-sm font-semibold text-zinc-300 leading-snug">{easiest?.q.title}</p>
            <div className="flex items-center justify-between">
              <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden mr-3">
                <div className="h-full rounded-full bg-emerald-400 transition-all duration-700" style={{ width: `${Math.round((easiest?.rate ?? 0) * 100)}%` }} />
              </div>
              <span className="text-xs font-black text-emerald-400 tabular-nums shrink-0">{Math.round((easiest?.rate ?? 0) * 100)}% acerto</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-4 text-zinc-500" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Desempenho por pergunta</p>
        </div>
        <div className="flex flex-col gap-3">
          {questionStats.map(({ q, i, rate }) => (
            <QuestionStatRow key={q.id} question={q} index={i} rate={rate} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="size-4 text-zinc-500" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Placar final</p>
        </div>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <ScoreRow key={p.id} player={p} rank={i} isMe={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Player View ──────────────────────────────────────────────────────────────

function PlayerView({
  currentPlayer,
  players,
  questions,
  answersPerQuestion,
}: {
  currentPlayer: Player;
  players: Player[];
  questions: Question[];
  answersPerQuestion: Answer[][];
}) {
  const guestPlayers = players.filter((p) => !p.isHost);
  const sorted = [...guestPlayers].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex((p) => p.id === currentPlayer.id);

  const myAnswers = questions.map((q, i) => {
    const answers = answersPerQuestion[i] ?? [];
    const myAnswer = answers.find((a) => a.playerId === currentPlayer.id);
    const correctId = getCorrectOptionId(q);
    const chosenOption = myAnswer ? q.options.find((o) => o.id === myAnswer.optionId) : null;
    const correctOption = q.options.find((o) => o.isCorrect);
    const status: "correct" | "wrong" | "skipped" = !myAnswer ? "skipped"
      : myAnswer.optionId === correctId ? "correct"
      : "wrong";
    return { q, status, chosenOption, correctOption };
  });

  const correctCount = myAnswers.filter((a) => a.status === "correct").length;
  const wrongCount = myAnswers.filter((a) => a.status === "wrong").length;
  const skippedCount = myAnswers.filter((a) => a.status === "skipped").length;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const rankIcons = [
    <Crown key="1" className="size-8 text-amber-400 fill-amber-400/20" />,
    <Award key="2" className="size-8 text-zinc-400 fill-zinc-400/20" />,
    <Star key="3" className="size-8 text-amber-700 fill-amber-700/20" />,
  ];
  const rankLabels = ["1° lugar", "2° lugar", "3° lugar", "4° lugar", "5° lugar", "6° lugar", "7° lugar", "8° lugar"];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-6 py-8 text-center flex flex-col items-center gap-3">
        <div className="size-14 rounded-2xl bg-zinc-800/80 flex items-center justify-center">
          {rankIcons[myRank] ?? <Trophy className="size-7 text-indigo-400" />}
        </div>
        <div>
          <p className="text-3xl font-black text-white mb-1">{rankLabels[myRank] ?? `${myRank + 1}° lugar`}</p>
          <p className="text-sm text-zinc-500">de {sorted.length} jogadores</p>
        </div>
        <div className="mt-1 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-sm font-black text-indigo-400 tabular-nums">{currentPlayer.score.toLocaleString()} pontos</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CheckCircle2} label="Acertos" animated numericValue={correctCount} valueColor="text-emerald-400" />
        <StatCard icon={XCircle} label="Erros" animated numericValue={wrongCount} valueColor="text-red-400" />
        {skippedCount > 0 && (
          <StatCard icon={Clock} label="Puladas" animated numericValue={skippedCount} valueColor="text-zinc-500" />
        )}
        <StatCard icon={Target} label="Precisão" value={`${accuracy}%`} valueColor={accuracy >= 70 ? "text-emerald-400" : accuracy >= 40 ? "text-amber-400" : "text-red-400"} />
      </div>

      <Podium players={players} />

      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="size-4 text-zinc-500" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Placar geral</p>
        </div>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <ScoreRow key={p.id} player={p} rank={i} isMe={p.id === currentPlayer.id} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="size-4 text-zinc-500" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Suas respostas</p>
        </div>
        <div className="flex flex-col gap-3">
          {myAnswers.map(({ q, status, chosenOption, correctOption }, i) => (
            <div
              key={q.id}
              className={[
                "flex items-start gap-4 rounded-xl border px-4 py-4",
                status === "correct" ? "border-emerald-500/25 bg-emerald-500/5"
                  : status === "wrong" ? "border-red-500/20 bg-red-500/5"
                  : "border-zinc-800/50 bg-zinc-900/30",
              ].join(" ")}
            >
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${status === "correct" ? "bg-emerald-500/15" : status === "wrong" ? "bg-red-500/10" : "bg-zinc-800/80"}`}>
                {status === "correct" && <CheckCircle2 className="size-4 text-emerald-400" />}
                {status === "wrong" && <XCircle className="size-4 text-red-400" />}
                {status === "skipped" && <Clock className="size-4 text-zinc-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Pergunta {i + 1}</span>
                  <span className={[
                    "text-[10px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md",
                    status === "correct" ? "text-emerald-400 bg-emerald-500/15"
                      : status === "wrong" ? "text-red-400 bg-red-500/10"
                      : "text-zinc-500 bg-zinc-800",
                  ].join(" ")}>
                    {status === "correct" ? "Correto" : status === "wrong" ? "Errou" : "Pulou"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-snug mb-2">{q.title}</p>
                {status === "correct" && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-400 font-medium">{chosenOption?.title}</p>
                  </div>
                )}
                {status === "wrong" && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="size-3 text-red-400 shrink-0" />
                      <p className="text-xs text-red-400 font-medium line-through opacity-70">{chosenOption?.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                      <p className="text-xs text-emerald-400 font-semibold">{correctOption?.title}</p>
                    </div>
                  </div>
                )}
                {status === "skipped" && (
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="size-3 text-zinc-600 shrink-0" />
                    <p className="text-xs text-zinc-600 font-medium">Não respondeu</p>
                    <span className="mx-1 text-zinc-700">·</span>
                    <p className="text-xs text-zinc-500 font-medium">Correta: {correctOption?.title}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FinishClient({ code, players, questions, answersPerQuestion, currentPlayer, currentIsHost }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const isHost = currentIsHost;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-[#080810] -z-10" />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(99,102,241,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] -z-10 pointer-events-none opacity-10"
        style={{
          background: "radial-gradient(ellipse, #6366f1 0%, #a855f7 50%, transparent 80%)",
          filter: "blur(80px)",
        }}
      />

      <div className="min-h-screen flex flex-col">
        <header className="border-b border-zinc-800/60 bg-[#080810]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 py-3 gap-4">
            <span className="text-sm font-black tracking-widest text-zinc-600 font-mono">{code}</span>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-emerald-300">Partida encerrada</span>
            </div>
            {isHost ? (
              <div className="flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1.5 shrink-0">
                <Crown className="size-3.5 text-purple-400" />
                <span className="text-xs font-black text-purple-300">Host</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 shrink-0">
                <Star className="size-3.5 text-indigo-400" />
                <span className="text-xs font-black text-indigo-300 tabular-nums">
                  {currentPlayer?.score ?? 0} pts
                </span>
              </div>
            )}
          </div>
        </header>

        <main className={`flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {isHost ? (
            <HostView players={players} questions={questions} answersPerQuestion={answersPerQuestion} />
          ) : currentPlayer ? (
            <PlayerView currentPlayer={currentPlayer} players={players} questions={questions} answersPerQuestion={answersPerQuestion} />
          ) : (
            <HostView players={players} questions={questions} answersPerQuestion={answersPerQuestion} />
          )}

          <div className="flex gap-3 mt-10 justify-center">
            <button
              onClick={() => router.push("/")}
              className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-sm font-black text-white shadow-[0_0_32px_rgba(99,102,241,.35)] hover:shadow-[0_0_48px_rgba(99,102,241,.55)] hover:from-indigo-400 hover:to-purple-500 active:scale-[.97] transition-all duration-300"
            >
              {isHost ? <><Plus className="size-4" />Nova partida</> : <><RefreshCw className="size-4" />Jogar de novo</>}
              <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}