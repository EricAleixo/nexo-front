"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Room } from "../types/types";

const API_URL = process.env.API_URL ?? "http://192.168.1.110:3000";

async function getCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
}

export async function updateRoom(
  roomId: string,
  data: { name?: string; subjectId?: string | null }
): Promise<Room> {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: await getCookieHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update room");

  revalidatePath("/");
  return response.json();
}

export async function deleteRoom(roomId: string): Promise<void> {
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
    headers: { Cookie: await getCookieHeader() },
  });

  if (!response.ok) throw new Error("Failed to delete room");

  revalidatePath("/");
}