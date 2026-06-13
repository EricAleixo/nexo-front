import { roomService } from "@/src/services/room.service";
import { subjectService } from "@/src/services/subject.service";
import { RefreshButton } from "./RefreshButton";
import { RoomList } from "./RoomList";

export async function PublicRooms() {
  const [apiRooms, subjects] = await Promise.all([
    roomService.findByUserId(),
    subjectService.findAll(),
  ]);

  return (
    <section id="salas-publicas" className="mt-10 pb-16">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Salas Públicas</h2>
          <p className="mt-1 text-sm text-slate-500">
            Participe de quizzes ao vivo criados por outros estudantes.
          </p>
        </div>
        <RefreshButton />
      </div>

      {apiRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            Nenhuma sala pública disponível no momento.
          </p>
          <p className="text-xs text-slate-400">Tente atualizar em alguns instantes.</p>
        </div>
      ) : (
        <RoomList initialRooms={apiRooms} subjects={subjects} />
      )}
    </section>
  );
}