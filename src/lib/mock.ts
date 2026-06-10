// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "started" | "finished";

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
}

// Mirrors room_tb schema + user FK (userId added for the relationship)
export interface Room {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  currentQuestion: number;
  totalQuestions: number;
  createdAt: string;
  // Relationship: room belongs to a user (host)
  userId: string;
  participantCount: number;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: "user-001",
    username: "rafael_dev",
    email: "rafael@example.com",
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    id: "user-002",
    username: "ana_quiz",
    email: "ana@example.com",
    createdAt: "2025-02-14T12:30:00Z",
  },
  {
    id: "user-003",
    username: "leo_mota",
    email: "leo@example.com",
    createdAt: "2025-03-01T09:00:00Z",
  },
];

// ─── Mock Rooms ───────────────────────────────────────────────────────────────

export const MOCK_ROOMS: Room[] = [
  {
    id: "room-001",
    code: "ABC123",
    name: "Quiz de Geografia",
    status: "waiting",
    currentQuestion: 0,
    totalQuestions: 10,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    userId: "user-001",
    participantCount: 3,
  },
  {
    id: "room-002",
    code: "XYZ789",
    name: "Historia do Brasil",
    status: "started",
    currentQuestion: 4,
    totalQuestions: 8,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    userId: "user-002",
    participantCount: 7,
  },
  {
    id: "room-003",
    code: "QZT456",
    name: "Ciências da Natureza",
    status: "finished",
    currentQuestion: 12,
    totalQuestions: 12,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    userId: "user-003",
    participantCount: 5,
  },
  {
    id: "room-004",
    code: "LMN321",
    name: "Cultura Pop anos 2000",
    status: "waiting",
    currentQuestion: 0,
    totalQuestions: 15,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    userId: "user-001",
    participantCount: 1,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}