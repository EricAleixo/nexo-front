"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

import { questionService } from "@/src/services/question.service";
import { StartGameButton, WaitingCard } from "./components/StartGameButton";
import { Toast, CountdownOverlay, type ToastItem } from "./components/LobbyUtils";
import { AddQuestionModal } from "@/src/components/modals/AddQuestionModal";
import { QuestionsPanel } from "./components/QuestionsPanel";
import { PlayersPanel } from "./components/PlayerPanel";
import { LobbyHeader } from "./components/LobbyHeader";
import { RoomInfoBar } from "./components/RoomInfo";
import { QuickJoinModal } from "./components/QuickJoinModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface Question {
  id: string;
  title: string;
  order: number;
}

interface RoomState {
  players: Player[];
  currentPlayer: {
    id: string;
    name: string;
    isHost: boolean;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "";

function createSocket(): Socket {
  return io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });
}

function generateToastId(): string {
  return Math.random().toString(36).slice(2);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  code: string;
  roomId: string;
  roomName: string;
  playersData: Player[];
  questionsData: Question[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LobbyClient({ code, roomId, roomName, playersData, questionsData }: Props) {
  const router = useRouter();

  // State
  const [players, setPlayers] = useState<Player[]>(playersData);
  const [questions, setQuestions] = useState<Question[]>(questionsData);
  const [currentPlayer, setCurrentPlayer] = useState<RoomState["currentPlayer"] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [quickJoinOpen, setQuickJoinOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lobby" | "ranking" | "configuracoes">("lobby");

  // Derived
  const isHost = currentPlayer?.isHost ?? false;
  const canStart = questions.length > 0 && !starting;
  const hostPlayer = useMemo(() => players.find((p) => p.isHost), [players]);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const joinedRef = useRef(false);

  // ── Toast helpers ─────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Countdown ─────────────────────────────────────────────────────────────

  const startCountdown = useCallback((onComplete: () => void) => {
    setCountdown(5);
    let current = 5;
    countdownRef.current = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setTimeout(onComplete, 900);
      }
    }, 1000);
  }, []);

  // ── Socket ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    function onConnect() {
      setQuickJoinOpen(false);
      if (joinedRef.current) return;
      joinedRef.current = true;
      socket.emit("join_room", { roomCode: code });
    }

    function onDisconnect(reason: string) {
      if (reason === "io server disconnect") {
        setQuickJoinOpen(true);
        return;
      }
      joinedRef.current = false;
    }

    function onRoomState(state: RoomState) {
      setPlayers(state.players);
      setCurrentPlayer(state.currentPlayer);
    }

    function onPlayerJoined(player: Player) {
      setPlayers((prev) =>
        prev.some((p) => p.id === player.id) ? prev : [...prev, player]
      );
      addToast(`${player.name} entrou na sala!`, "info");
    }

    function onPlayerLeft(playerId: string) {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }

    function onRoomClosed() {
      addToast("O host encerrou a sala.", "error");
      setTimeout(() => router.push("/"), 1500);
    }

    function onGameStarted() {
      startCountdown(() => router.push(`/room/${code}/game`));
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", () => setQuickJoinOpen(true));
    socket.on("room:state", onRoomState);
    socket.on("player_joined", onPlayerJoined);
    socket.on("player_left", onPlayerLeft);
    socket.on("room_closed", onRoomClosed);
    socket.on("game_started", onGameStarted);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error");
      socket.off("room:state", onRoomState);
      socket.off("player_joined", onPlayerJoined);
      socket.off("player_left", onPlayerLeft);
      socket.off("room_closed", onRoomClosed);
      socket.off("game_started", onGameStarted);
      socket.disconnect();
      socketRef.current = null;
      joinedRef.current = false;
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const handleQuickJoined = useCallback(() => {
    setQuickJoinOpen(false);
    joinedRef.current = false;
    socketRef.current?.connect();
  }, []);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      addToast("Código copiado!", "success");
    } catch {
      addToast("Não foi possível copiar.", "error");
    }
  }, [code, addToast]);

  const handleQuestionAdded = useCallback(
    (question: Question) => {
      setQuestions((prev) => [...prev, question]);
      addToast("Pergunta adicionada!", "success");
    },
    [addToast]
  );

  const handleDeleteQuestion = useCallback(
    async (id: string) => {
      try {
        await questionService.delete(id);
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        addToast("Pergunta removida.", "info");
      } catch {
        addToast("Erro ao remover pergunta.", "error");
      }
    },
    [addToast]
  );

  const handleSetCorrect = useCallback(
    async (optionId: string) => {
      try {
        await questionService.updateCurrect(optionId);
        addToast("Alternativa correta atualizada!", "success");
      } catch {
        addToast("Erro ao atualizar alternativa.", "error");
      }
    },
    [addToast]
  );

  const handleStartGame = useCallback(() => {
    if (questions.length === 0) {
      addToast("Adicione pelo menos uma pergunta antes de iniciar.", "error");
      return;
    }
    setStarting(true);
    socketRef.current?.emit("start_game");
  }, [questions.length, addToast]);

  const handleLeaveRoom = useCallback(() => {
    router.push("/");
  }, [router]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Countdown overlay */}
      {countdown !== null && <CountdownOverlay count={countdown} />}

      {/* Quick join modal (reconnect) */}
      <QuickJoinModal
        open={quickJoinOpen}
        roomCode={code}
        roomName={roomName}
        onJoined={handleQuickJoined}
      />

      {/* Background */}
      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <LobbyHeader
          roomName={roomName}
          code={code}
          currentPlayerName={currentPlayer?.name ?? "..."}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLeaveRoom={handleLeaveRoom}
        />

        {/* Main content */}
        <main className="mx-auto max-w-screen-xl px-6 py-6">
          {/* Room info bar */}
          <div className="mb-6">
            <RoomInfoBar
              roomName={roomName}
              code={code}
              playerCount={players.length}
              questionCount={questions.length}
              onCopyCode={handleCopyCode}
            />
          </div>

          {/* Two-column layout */}
          <div className="flex gap-5 lg:items-start">
            {/* Left: questions */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <QuestionsPanel
                questions={questions}
                isHost={isHost}
                onAddQuestion={() => setModalOpen(true)}
                onDeleteQuestion={handleDeleteQuestion}
                onSetCorrect={handleSetCorrect}
              />
            </div>

            {/* Right: players + start/wait */}
            <aside className="flex w-72 shrink-0 flex-col gap-4">
              <PlayersPanel
                players={players}
                currentPlayerId={currentPlayer?.id}
              />

              {isHost ? (
                <StartGameButton
                  canStart={canStart}
                  starting={starting}
                  questionCount={questions.length}
                  onClick={handleStartGame}
                />
              ) : (
                <WaitingCard hostName={hostPlayer?.name} />
              )}
            </aside>
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Add question modal */}
      {isHost && roomId && (
        <AddQuestionModal
          open={modalOpen}
          roomId={roomId}
          nextOrder={questions.length + 1}
          onClose={() => setModalOpen(false)}
          onQuestionAdded={handleQuestionAdded}
        />
      )}
    </>
  );
}