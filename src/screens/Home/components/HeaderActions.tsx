"use client";

import { useState } from "react";
import { Grid2X2, Plus } from "lucide-react";
import { CreateRoomModal } from "@/src/components/modals/CreateRoomModal";

interface HeaderActionsProps {
  onExplore?: () => void;
}

export function HeaderActions({ onExplore }: HeaderActionsProps) {

  return (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <button
          type="button"
          onClick={onExplore}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Grid2X2 className="size-4" />
          Explorar
        </button>
      </div>

    </>
  );
}
