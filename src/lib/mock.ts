// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "waiting" | "started" | "finished";

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
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


// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}