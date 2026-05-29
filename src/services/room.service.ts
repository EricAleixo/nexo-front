import { cookies } from "next/headers";
import { Room } from "../lib/mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.107:3000";


class RoomService {
  async create(playerName: string, userId: string): Promise<Room> {
    const response = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create room");
    }

    return response.json();
  }

  async findByCode(code: string): Promise<Room> {
    const response = await fetch(`${API_URL}/rooms/${code}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch room");
    }

    return response.json();
  }


  async findByUserId(): Promise<Room[]> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await fetch(`${API_URL}/rooms/user/me`, {
      headers: {
        Cookie: cookieHeader,  // ← repassa o cookie pro NestJS
      },
      cache: "no-store",
    });

    if (!response.ok) return [];
    return response.json();
  }

  async start(roomId: string): Promise<Room> {
    const response = await fetch(`${API_URL}/rooms/${roomId}/start`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Failed to start room");
    }

    return response.json();
  }

  async finish(roomId: string): Promise<Room> {
    const response = await fetch(`${API_URL}/rooms/${roomId}/finish`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Failed to finish room");
    }

    return response.json();
  }

  async delete(roomId: string): Promise<void> {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete room");
    }
  }
}

export const roomService = new RoomService();