"use client";

import { useState } from "react";
import { Room, Subject } from "@/src/types/types";
import { RoomCard } from "./RoomCard";
import { updateRoom, deleteRoom } from "@/src/actions/room.actions";
import { EditRoomPayload } from "@/src/components/modals/EditRoomModal";

interface RoomListProps {
  initialRooms: Room[];
  subjects: Subject[];
}

export function RoomList({ initialRooms, subjects }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  async function handleEdit(room: Room, payload: EditRoomPayload) {
    const updated = await updateRoom(room.id, payload);
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleDelete(room: Room) {
    await deleteRoom(room.id);
    setRooms((prev) => prev.filter((r) => r.id !== room.id));
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          subjects={subjects}
          onEdit={(payload) => handleEdit(room, payload)}
          onDelete={() => handleDelete(room)}
        />
      ))}
    </div>
  );
}