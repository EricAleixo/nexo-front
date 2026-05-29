import { RoomCard } from "./cards/RoomCard";
import { Room } from "../lib/mock";
import { authService } from "../services/auth.service";
import { roomService } from "../services/room.service";


export async function RoomGrid() {
  const user = await authService.getMe();
  const myRooms: Room[] = await roomService.findByUserId();
  console.log(myRooms)

  return (
    <section className="relative w-full max-w-5xl px-4 pb-24">
      {/* Section header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-xl font-black text-zinc-100"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Minhas Salas
          </h2>
          <p className="text-xs text-zinc-600">
            {`${myRooms.length} sala${myRooms.length !== 1 ? "s" : ""} criada${myRooms.length !== 1 ? "s" : ""} por você`}
          </p>
        </div>
      </div>

      {/* Grid */}
      {myRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <span className="text-3xl">🎮</span>
          <p className="text-sm font-medium text-zinc-500">
            Você ainda não criou nenhuma sala.
          </p>
          <p className="text-xs text-zinc-700">Que tal criar uma?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              user={user}
            />
          ))}
        </div>
      )}

      {/* Live indicator */}
      {myRooms.some((r) => r.status === "started") && (
        <p className="mt-6 text-center text-[11px] text-zinc-700">
          <span className="inline-block size-1.5 rounded-full bg-emerald-400 align-middle mr-1 animate-pulse" />
          Salas ao vivo atualizam em tempo real via WebSocket
        </p>
      )}
    </section>
  );
}