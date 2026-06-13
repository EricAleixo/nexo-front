"use client";

import { useState } from "react";
import { Grid3X3, Plus } from "lucide-react";
import { CreateRoomModal } from "@/src/components/modals/CreateRoomModal";
import { JoinRoomModal } from "@/src/components/modals/JoinRoomModal";
import { Subject } from "@/src/types/types";

type props = {
  subjectsInitialData: Subject[]
}

export function HeroActions({ subjectsInitialData }: props) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-md font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Criar Sala
        </button>

        <button
          type="button"
          onClick={() => setShowJoin(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-500 px-5 py-3 text-md font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          <Grid3X3 className="size-4" strokeWidth={2.5} />
          Entrar com Código
        </button>
      </div>

      <CreateRoomModal open={showCreate} onClose={() => setShowCreate(false)} subjectsInitialData={subjectsInitialData} />
      <JoinRoomModal open={showJoin} onClose={() => setShowJoin(false)} />
    </>
  );
}
